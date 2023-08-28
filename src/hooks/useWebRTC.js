import { useEffect, useRef, useCallback } from 'react'
import freeice from 'freeice'
import useStateWithCallback from './useStateWithCallback'
import { socket } from '../socket'
import { useAppContext } from '../context/Context'
import { videoParams } from '../helpers/mediaParams'

export const useWebRTC = (room) => {
  const [clients, updateClients] = useStateWithCallback([])
  // const { peers, userMediaElement, peerMediaElements, userMediaElement } = useAppContext()

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

  const peers = useRef({})
  const userMediaElement = useRef(null)
  const peerMediaElements = useRef({ ['localStream']: null })

  useEffect(() => {
    const handleNewPeer = async ({ peer, shouldCreateOffer }) => {
      if (peer in peers.current) {
        return
      }

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
          addNewClient(peer, () => {
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

    socket.on('ADD_PEER', handleNewPeer)
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
  }, [])

  useEffect(() => {
    socket.on('ICE_CANDIDATE', ({ peer, iceCandidate }) => {
      peers.current[peer]?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => socket.off('ICE_CANDIDATE')
  }, [])

  useEffect(() => {
    const handleRemovePeer = ({ peer }) => {
      if (peers.current[peer]) {
        peers.current[peer].close()
      }

      delete peers.current[peer]
      delete peerMediaElements.current[peer]

      updateClients((list) => list.filter((c) => c !== peer))
    }

    socket.on('REMOVE_PEER', handleRemovePeer)

    return () => socket.off('REMOVE_PEER')
  }, [])

  useEffect(() => {
    const startCapture = async () => {
      userMediaElement.current = await navigator.mediaDevices.getUserMedia(videoParams)

      addNewClient('localStream', () => {
        const localStream = peerMediaElements.current['localStream']

        if (localStream) {
          localStream.volume = 0
          localStream.srcObject = userMediaElement.current
        }
      })

      socket.emit('JOIN_ROOM', { room })
    }

    const stopCapture = () => {
      userMediaElement.current?.getTracks().forEach((track) => track.stop())
      socket.emit('LEAVE_ROOM')
    }

    startCapture()
    return () => stopCapture()
  }, [room])

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node
  }, [])

  return { clients, provideMediaRef }
}
