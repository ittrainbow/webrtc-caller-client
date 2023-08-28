import { useEffect } from 'react'
import freeice from 'freeice'

import { useAppContext } from '../context/Context'
import { socket } from '../socket'

export const usePeers = (room) => {
  const { peers, userMediaElement, peerMediaElements, removePeer, clients, updateClients, addClient } = useAppContext()

  useEffect(() => {
    const handleAddPeer = async ({ peer, shouldCreateOffer }) => {
      peers.current[peer] = new RTCPeerConnection({ iceServers: freeice() })

      peers.current[peer].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('transmit_ice', { peer, iceCandidate })
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
        socket.emit('transmit_sdp', { peer, sessionDescription })
      }
    }

    socket.on('add_peer', handleAddPeer)
    return () => socket.off('add_peer')
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const handleRemotePeerMedia = async ({ peer, sessionDescription }) => {
      const { type } = sessionDescription
      await peers.current[peer].setRemoteDescription(new RTCSessionDescription(sessionDescription))

      if (type === 'offer') {
        const answer = await peers.current[peer].createAnswer()
        await peers.current[peer].setLocalDescription(answer)
        const sessionDescription = answer
        socket.emit('transmit_sdp', { peer, sessionDescription })
      }
    }

    socket.on('emit_sdp', handleRemotePeerMedia)
    return () => socket.off('emit_sdp')
    // eslint-disable-next-line
  }, [room])

  useEffect(() => {
    socket.on('emit_ice', ({ peer, iceCandidate }) => {
      peers.current[peer].addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => socket.off('emit_ice')
  }, [peers])

  useEffect(() => {
    const handleRemovePeer = ({ peer }) => {
      removePeer(peer)
      updateClients((clients) => {
        const newClients = clients.filter((client) => client !== peer)
        return newClients
      })
    }

    socket.on('remove_peer', handleRemovePeer)
    // eslint-disable-next-line
  }, [clients])

  return clients
}
