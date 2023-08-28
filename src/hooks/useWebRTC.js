import { useEffect, useRef, useCallback } from 'react'
import freeice from 'freeice'
import useStateWithCallback from './useStateWithCallback'
import { socket } from '../socket'
import { useAppContext } from '../context/Context'

export const useWebRTC = (room) => {
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
    const handleNewPeer = async ({ peer, shouldCreateOffer }) => {
      if (peer in peerConnections.current) {
        return
      }

      peerConnections.current[peer] = new RTCPeerConnection({ iceServers: freeice() })

      peerConnections.current[peer].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('RELAY_ICE', { peer, iceCandidate })
      }

      let tracksNumber = 0
      peerConnections.current[peer].ontrack = ({ streams: [remoteStream] }) => {
        tracksNumber++

        if (tracksNumber === 2) {
          tracksNumber = 0
          addNewClient(peer, () => {
            if (peerMediaElements.current[peer]) {
              peerMediaElements.current[peer].srcObject = remoteStream
            }
          })
        }
      }

      localMediaStream.current?.getTracks().forEach((track) => {
        peerConnections.current[peer].addTrack(track, localMediaStream.current)
      })

      if (shouldCreateOffer) {
        const offer = await peerConnections.current[peer].createOffer()
        const sessionDescription = offer
        await peerConnections.current[peer].setLocalDescription(offer)
        socket.emit('RELAY_SDP', { peer, sessionDescription })
      }
    }

    socket.on('ADD_PEER', handleNewPeer)
    return () => socket.off('ADD_PEER')
  }, [])

  useEffect(() => {
    const handleRemoteMedia = async ({ peer, sessionDescription }) => {
      const { type } = sessionDescription
      await peerConnections.current[peer].setRemoteDescription(new RTCSessionDescription(sessionDescription))

      if (type === 'offer') {
        const answer = await peerConnections.current[peer].createAnswer()
        await peerConnections.current[peer].setLocalDescription(answer)
        const sessionDescription = answer
        socket.emit('RELAY_SDP', { peer, sessionDescription })
      }
    }

    socket.on('SESSION_DESCRIPTION', handleRemoteMedia)
    return () => socket.off('SESSION_DESCRIPTION')
  }, [])

  useEffect(() => {
    socket.on('ICE_CANDIDATE', ({ peer, iceCandidate }) => {
      peerConnections.current[peer]?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => socket.off('ICE_CANDIDATE')
  }, [])

  useEffect(() => {
    const handleRemovePeer = ({ peer }) => {
      if (peerConnections.current[peer]) {
        peerConnections.current[peer].close()
      }

      delete peerConnections.current[peer]
      delete peerMediaElements.current[peer]

      updateClients((list) => list.filter((c) => c !== peer))
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

      socket.emit('JOIN_ROOM', { room })
    }

    const stopCapture = () => {
      localMediaStream.current?.getTracks().forEach((track) => track.stop())
      socket.emit('LEAVE_ROOM')
    }

    startCapture()
    return () => stopCapture()
  }, [room])

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node
  }, [])

  return {
    clients,
    provideMediaRef
  }
}
