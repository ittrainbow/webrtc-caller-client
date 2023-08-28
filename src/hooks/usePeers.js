import { useEffect } from 'react'
import freeice from 'freeice'
import { socket } from '../socket'
import { useAppContext } from '../context/Context'

export const usePeers = (room) => {
  const {
    peers,
    userMediaElement,
    peerMediaElements,
    removePeer,
    clients,
    updateClients,
    addClient
  } = useAppContext()

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
          const addPeer = () => {
            if (peerMediaElements.current[peer]) peerMediaElements.current[peer].srcObject = remoteStream
          }
          addClient(peer, addPeer)
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
    // eslint-disable-next-line
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
    // eslint-disable-next-line
  }, [room])

  useEffect(() => {
    socket.on('ICE_CANDIDATE', ({ peer, iceCandidate }) => {
      peers.current[peer].addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => socket.off('ICE_CANDIDATE')
  }, [peers])

  useEffect(() => {
    const handleRemovePeer = ({ peer }) => {
      removePeer(peer)
      updateClients((clients) => {
        const newClients = clients.filter((client) => client !== peer)
        return newClients
      })
    }

    socket.on('REMOVE_PEER', handleRemovePeer)
    // eslint-disable-next-line
  }, [clients])

  return clients
}
