import { useEffect, useCallback, useRef, useState } from 'react'
import freeice from 'freeice'
import { socket } from '../socket'
import { useAppContext } from '../context/Context'
import { videoParams } from '../helpers/mediaParams'

export const usePeers = (room) => {
  const callbackRef = useRef(null)
  const [clients, setClients] = useState([])
  const { peers, userMediaElement, peerMediaElements, stopUserMediaElementTracks, removePeer } = useAppContext()

  const updateClients = useCallback((newClients, callback) => {
    callbackRef.current = callback
    setClients(newClients)
  }, [])

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(clients)
      callbackRef.current = null
    }
  }, [clients])

  const addClient = useCallback(
    (newClient, callback) => {
      updateClients((clients) => {
        if (!clients.includes(newClient)) {
          return [...clients, newClient]
        }

        return clients
      }, callback)
    },
    [updateClients]
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
        return clients.filter((client) => client !== peer)
      })
    }

    socket.on('REMOVE_PEER', handleRemovePeer)
    return () => socket.off('REMOVE_PEER')
    // eslint-disable-next-line
  }, [clients])

  useEffect(() => {
    const startCapture = async () => {
      userMediaElement.current = await navigator.mediaDevices.getUserMedia(videoParams)
      const addLocal = () => {
        peerMediaElements.current['localStream'].volume = 0
        peerMediaElements.current['localStream'].srcObject = userMediaElement.current
      }
      addClient('localStream', addLocal)

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
