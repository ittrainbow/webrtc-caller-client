import { useEffect, useCallback } from 'react'
import freeice from 'freeice'
import useStateWithCallback from './useStateWithCallback'
import { socket } from '../socket'
import { useAppContext } from '../context/Context'
import { videoParams } from '../helpers/mediaParams'

export const usePeers = (room) => {
  const {
    peers,
    userMediaElement,
    peerMediaElements,
    stopUserMediaElementTracks,
    removePeer
    // clients,
    // updateClients,
    // addClient
  } = useAppContext()

  const [clients, updateClients] = useStateWithCallback([])

  const addClient = useCallback(
    (newClient, callback) => {
      updateClients((clients) => {
        if (!clients.includes(newClient)) {
          return [...clients, newClient]
        }

        return clients
      }, callback)
    },
    [clients, updateClients]
  )

  useEffect(() => {
    const handleAddPeer = async ({ peer, shouldCreateOffer }) => {
      peers.current[peer] = new RTCPeerConnection({ iceServers: freeice() })

      peers.current[peer].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('RELAY_ICE', { peer, iceCandidate })
      }

      let tracksNumber = 0
      peers.current[peer].ontrack = ({ streams: [remoteStream] }) => {
        tracksNumber++

        if (tracksNumber === 2) {
          tracksNumber = 0
          addClient(peer, () => {
            if (peerMediaElements.current[peer]) {
              peerMediaElements.current[peer].srcObject = remoteStream
            }
          })
        }
      }

      userMediaElement.current?.getTracks().forEach((track) => {
        peers.current[peer].addTrack(track, userMediaElement.current)
      })

      if (shouldCreateOffer) {
        const offer = await peers.current[peer].createOffer()
        const sessionDescription = offer
        await peers.current[peer].setLocalDescription(offer)
        socket.emit('RELAY_SDP', { peer, sessionDescription })
      }
    }

    socket.on('ADD_PEER', handleAddPeer)
    return () => socket.off('ADD_PEER')
  }, [])

  useEffect(() => {
    const handleRemoteMedia = async ({ peer, sessionDescription }) => {
      const { type } = sessionDescription
      await peers.current[peer].setRemoteDescription(new RTCSessionDescription(sessionDescription))

      if (type === 'offer') {
        const answer = await peers.current[peer].createAnswer()
        await peers.current[peer].setLocalDescription(answer)
        const sessionDescription = answer
        socket.emit('RELAY_SDP', { peer, sessionDescription })
      }
    }

    socket.on('SESSION_DESCRIPTION', handleRemoteMedia)
    return () => socket.off('SESSION_DESCRIPTION')
  }, [room])

  useEffect(() => {
    socket.on('ICE_CANDIDATE', ({ peer, iceCandidate }) => {
      peers.current[peer].addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => socket.off('ICE_CANDIDATE')
  }, [])

  useEffect(() => {
    const handleRemovePeer = ({ peer }) => {
      removePeer(peer)
      updateClients((clients) => {
        return clients.filter((client) => client !== peer)
      })
    }

    socket.on('REMOVE_PEER', handleRemovePeer)
    return () => socket.off('REMOVE_PEER')
  }, [clients])

  useEffect(() => {
    const startCapture = async () => {
      userMediaElement.current = await navigator.mediaDevices.getUserMedia(videoParams)

      addClient('localStream', () => {
        const localStream = peerMediaElements.current['localStream']

        if (localStream) {
          localStream.volume = 0
          localStream.srcObject = userMediaElement.current
        }
      })

      socket.emit('JOIN_ROOM', { room })
    }

    const stopCapture = () => {
      stopUserMediaElementTracks()
      socket.emit('LEAVE_ROOM')
    }

    startCapture()
    return () => stopCapture()
  }, [room])

  return { clients }
}
