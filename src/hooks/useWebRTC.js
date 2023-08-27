import { useEffect, useRef, useCallback } from 'react'
import freeice from 'freeice'
import useStateWithCallback from './useStateWithCallback'
import { socket } from '../socket'

export const useWebRTC = (roomID) => {
  const [clients, updateClients] = useStateWithCallback([])

  const addNewClient = useCallback(
    (newClient, cb) => {
      updateClients((list) => {
        if (!list.includes(newClient)) {
          return [...list, newClient]
        }

        return list
      }, cb)
    },
    [clients, updateClients]
  )

  const peerConnections = useRef({})
  const localMediaStream = useRef(null)
  const peerMediaElements = useRef({
    ['localStream']: null
  })

  useEffect(() => {
    const handleNewPeer = async ({ peerID, shouldCreateOffer }) => {
      if (peerID in peerConnections.current) {
        return console.warn(`Already connected to peer ${peerID}`)
      }

      peerConnections.current[peerID] = new RTCPeerConnection({
        iceServers: freeice()
      })

      peerConnections.current[peerID].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('RELAY_ICE', { peerID, iceCandidate })
      }

      let tracksNumber = 0
      peerConnections.current[peerID].ontrack = ({ streams: [remoteStream], index }) => {
        tracksNumber++

        if (tracksNumber === 2) {
          // video & audio tracks received
          tracksNumber = 0
          addNewClient(peerID, () => {
            if (peerMediaElements.current[peerID]) {
              peerMediaElements.current[peerID].srcObject = remoteStream
            }
            // else {
            //   // FIX LONG RENDER IN CASE OF MANY CLIENTS
            //   let settled = false
            //   const interval = setInterval(() => {
            //     if (peerMediaElements.current[peerID]) {
            //       peerMediaElements.current[peerID].srcObject = remoteStream
            //       settled = true
            //     }

            //     if (settled) {
            //       clearInterval(interval)
            //     }
            //   }, 1000)
            // }
          })
        }
      }

      localMediaStream.current?.getTracks().forEach((track) => {
        peerConnections.current[peerID].addTrack(track, localMediaStream.current)
      })

      if (shouldCreateOffer) {
        const offer = await peerConnections.current[peerID].createOffer()
        const sessionDescription = offer
        await peerConnections.current[peerID].setLocalDescription(offer)
        socket.emit('RELAY_SDP', { peerID, sessionDescription })
      }
    }

    socket.on('ADD_PEER', handleNewPeer)
    return () => socket.off('ADD_PEER')
  }, [])

  useEffect(() => {
    async function setRemoteMedia({ peerID, sessionDescription: remoteDescription }) {
      await peerConnections.current[peerID]?.setRemoteDescription(new RTCSessionDescription(remoteDescription))

      if (remoteDescription.type === 'offer') {
        const answer = await peerConnections.current[peerID].createAnswer()
        await peerConnections.current[peerID].setLocalDescription(answer)
        const sessionDescription = answer
        socket.emit('RELAY_SDP', { peerID, sessionDescription })
      }
    }

    socket.on('SESSION_DESCRIPTION', setRemoteMedia)
    return () => socket.off('SESSION_DESCRIPTION')
  }, [])

  useEffect(() => {
    socket.on('ICE_CANDIDATE', ({ peerID, iceCandidate }) => {
      peerConnections.current[peerID]?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => {
      socket.off('ICE_CANDIDATE')
    }
  }, [])

  useEffect(() => {
    const handleRemovePeer = ({ peerID }) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close()
      }

      delete peerConnections.current[peerID]
      delete peerMediaElements.current[peerID]

      updateClients((list) => list.filter((c) => c !== peerID))
    }

    socket.on('REMOVE_PEER', handleRemovePeer)

    return () => {
      socket.off('REMOVE_PEER')
    }
  }, [])

  useEffect(() => {
    async function startCapture() {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 320,
          height: 240
        }
      })

      addNewClient('localStream', () => {
        const localVideoElement = peerMediaElements.current['localStream']

        if (localVideoElement) {
          localVideoElement.volume = 0
          localVideoElement.srcObject = localMediaStream.current
        }
      })
    }

    startCapture()
      .then(() => socket.emit('JOIN_ROOM', { roomID }))
      .catch((e) => console.error('Error getting userMedia:', e))

    return () => {
      localMediaStream.current.getTracks().forEach((track) => track.stop())

      socket.emit('LEAVE_ROOM')
    }
  }, [roomID])

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node
  }, [])

  return {
    clients,
    provideMediaRef
  }
}
