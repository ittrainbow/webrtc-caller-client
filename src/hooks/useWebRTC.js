import { useEffect, useRef, useCallback } from 'react'
import freeice from 'freeice'
import useStateWithCallback from './useStateWithCallback'
import { socket } from '../socket'
import { useAppContext } from '../context/Context'

export const useWebRTC = (roomID) => {
  const [clients, updateClients] = useStateWithCallback([])
  // const { peerConnections, localMediaStream, peerMediaElements } = useAppContext()

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
  const peerMediaElements = useRef({ ['localStream']: null })

  useEffect(() => {
    const handleNewPeer = async ({ peerID, shouldCreateOffer }) => {
      if (peerID in peerConnections.current) {
        return
      }

      peerConnections.current[peerID] = new RTCPeerConnection({ iceServers: freeice() })

      peerConnections.current[peerID].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('RELAY_ICE', { peerID, iceCandidate })
      }

      let tracksNumber = 0
      peerConnections.current[peerID].ontrack = ({ streams: [remoteStream] }) => {
        tracksNumber++

        if (tracksNumber === 2) {
          tracksNumber = 0
          addNewClient(peerID, () => {
            if (peerMediaElements.current[peerID]) {
              peerMediaElements.current[peerID].srcObject = remoteStream
            }
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
    const handleRemoteMedia = async ({ peerID, sessionDescription }) => {
      const { type } = sessionDescription
      await peerConnections.current[peerID].setRemoteDescription(new RTCSessionDescription(sessionDescription))

      if (type === 'offer') {
        const answer = await peerConnections.current[peerID].createAnswer()
        await peerConnections.current[peerID].setLocalDescription(answer)
        const sessionDescription = answer
        socket.emit('RELAY_SDP', { peerID, sessionDescription })
      }
    }

    socket.on('SESSION_DESCRIPTION', handleRemoteMedia)
    return () => socket.off('SESSION_DESCRIPTION')
  }, [])

  useEffect(() => {
    socket.on('ICE_CANDIDATE', ({ peerID, iceCandidate }) => {
      peerConnections.current[peerID]?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => socket.off('ICE_CANDIDATE')
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

    return () => socket.off('REMOVE_PEER')
  }, [])

  useEffect(() => {
    const startCapture = async () => {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 320, height: 240 }
      })

      addNewClient('localStream', () => {
        const localStream = peerMediaElements.current['localStream']

        if (localStream) {
          localStream.volume = 0
          localStream.srcObject = localMediaStream.current
        }
      })

      socket.emit('JOIN_ROOM', { roomID })
    }

    const stopCapture = () => {
      localMediaStream.current?.getTracks().forEach((track) => track.stop())
      socket.emit('LEAVE_ROOM')
    }

    startCapture()
    return () => stopCapture()
  }, [roomID])

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node
  }, [])

  return {
    clients,
    provideMediaRef
  }
}
