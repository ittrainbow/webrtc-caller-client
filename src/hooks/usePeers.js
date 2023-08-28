import { useEffect } from 'react'
import freeice from 'freeice'
import { socket } from '../socket'
import { useAppContext } from '../context/Context'
import { videoParams } from '../helpers/mediaParams'

export const usePeers = (room) => {
  const {
    peers,
    userMediaElement,
    peerMediaElements,
    stopUserMediaElementTracks,
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
      console.log(121, peer)
      removePeer(peer)
      console.log(122)
      updateClients((clients) => {
        const newClients = clients.filter((client) => client !== peer)
        console.log(123, newClients)
        return newClients
      })
    }

    socket.on('REMOVE_PEER', handleRemovePeer)
    // return () => socket.off('REMOVE_PEER')
    // eslint-disable-next-line
  }, [clients])

  useEffect(() => {
    const startCapture = async () => {
      userMediaElement.current = await navigator.mediaDevices.getUserMedia(videoParams)
      const addLocal = () => {
        peerMediaElements.current[socket.id].volume = 0
        peerMediaElements.current[socket.id].srcObject = userMediaElement.current
      }
      addClient(socket.id, addLocal)

      socket.emit('JOIN_ROOM', { room })
    }

    const stopCapture = () => {
      stopUserMediaElementTracks()
      socket.emit('LEAVE_ROOM')
    }

    startCapture()
    return () => stopCapture()
    // eslint-disable-next-line
  }, [room])

  return clients
}
