import { useEffect } from 'react'

import { iceServers } from '../helpers/iceServers'
import { useAppContext } from '../context/Context'
import { socket } from '../socket'

export const usePeers = (room) => {
  const { peers, userMediaElement, peerMediaElements, removePeer, users, updateUsers, addUser } = useAppContext()

  useEffect(() => {
    const handleAddPeer = async ({ peer, shouldCreateOffer }) => {
      peers.current[peer] = new RTCPeerConnection({ iceServers })

      peers.current[peer].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('transmit_ice', { peer, iceCandidate })
      }

      peers.current[peer].ontrack = ({ streams: [remoteStream] }) => {
        const addPeer = () => {
          if (peerMediaElements.current[peer]) {
            peerMediaElements.current[peer].srcObject = remoteStream
          }
        }
        addUser(peer, addPeer)
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
    const handleRemotePeer = async ({ peer, sessionDescription }) => {
      const { type } = sessionDescription
      await peers.current[peer].setRemoteDescription(new RTCSessionDescription(sessionDescription))

      if (type === 'offer') {
        const answer = await peers.current[peer].createAnswer()
        answer.sdp = answer.sdp.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=128000')
        await peers.current[peer].setLocalDescription(answer)
        const sessionDescription = answer
        socket.emit('transmit_sdp', { peer, sessionDescription })
      }
    }

    socket.on('emit_sdp', handleRemotePeer)
    return () => socket.off('emit_sdp')
    // eslint-disable-next-line
  }, [room])

  useEffect(() => {
    const handleIceCandidate = ({ peer, iceCandidate }) => {
      peers.current[peer].addIceCandidate(new RTCIceCandidate(iceCandidate))
    }

    socket.on('emit_ice', handleIceCandidate)
  }, [peers])

  useEffect(() => {
    const handleRemovePeer = ({ peer }) => {
      removePeer(peer)
      updateUsers((users) => {
        const newUsers = users.filter((user) => user !== peer)
        return newUsers
      })
    }

    socket.on('remove_peer', handleRemovePeer)
    // eslint-disable-next-line
  }, [users])
}
