import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { toJS, autorun } from 'mobx'

import { iceServers } from '../helpers/iceServers'
import { useAppContext } from '../context/Context'
import { ADD_PEER, REMOVE_PEER } from '../types'
import { socket } from '../socket'

import { mediaStore } from '../mobx/userMediaStore'
const store = mediaStore()

const { peersStore, userMediaStore, peerMediaStore } = store

autorun(() => console.log(5, userMediaStore))

const notEmpty = (obj) => !!Object.keys(obj).length

export const usePeers = (room) => {
  const { peers, userMediaElement, peerMediaElements, callbackRef } = useAppContext()
  const { users } = useSelector((store) => store.app)

  const mobxUserMedia = toJS(store.userMediaStore)
  const mobxPeers = toJS(store.peerMediaStore)
  const { newConnection } = store

  // console.log(1, peers)
  // autorun(() => console.log(2, mobxPeers))

  useEffect(() => {
    const handleAddPeer = async ({ peer, shouldCreateOffer }) => {
      //
      peers.current[peer] = new RTCPeerConnection({ iceServers })
      // newConnection(peer)

      //
      peers.current[peer].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('transmit_ice', { peer, iceCandidate })
      }

      peersStore[peer].onicecandidate = (event) => {
        const iceCandidate = event.candidate
        iceCandidate && socket.emit('transmit_ice', { peer, iceCandidate })
      }

      //
      peers.current[peer].ontrack = ({ streams: [remoteStream] }) => {
        const addPeer = () => {
          if (peerMediaElements.current[peer]) {
            peerMediaElements.current[peer].srcObject = remoteStream
          }
        }

        callbackRef.current = addPeer
      }

      peersStore[peer].ontrack = ({ streams: [remoteStream] }) => {
        const addPeer = () => {
          if (peerMediaStore[peer]) {
            peerMediaStore[peer].srcObject = remoteStream
          }
        }

        callbackRef.current = addPeer
      }

      //
      userMediaElement.current?.getTracks().forEach((track) => {
        peers.current[peer].addTrack(track, userMediaElement.current)
      })

      notEmpty(mobxUserMedia) &&
        mobxUserMedia.getTracks().forEach((track) => {
          peers.current[peer].addTrack(track, userMediaElement.current)
        })

      if (shouldCreateOffer) {
        const offer = await peers.current[peer].createOffer()
        const sessionDescription = offer
        await peers.current[peer].setLocalDescription(offer)
        socket.emit('transmit_sdp', { peer, sessionDescription })
      }
    }

    socket.on(ADD_PEER, handleAddPeer)

    return () => socket.off(ADD_PEER, handleAddPeer)
    // eslint-disable-next-line
  }, [users])

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

    return () => socket.off('emit_sdp', handleRemotePeer)
    // eslint-disable-next-line
  }, [room])

  useEffect(() => {
    const handleIceCandidate = ({ peer, iceCandidate }) => {
      peers.current[peer].addIceCandidate(new RTCIceCandidate(iceCandidate))
    }

    socket.on('emit_ice', handleIceCandidate)

    return () => socket.off('emit_ice', handleIceCandidate)
  }, [peers])

  useEffect(() => {
    const handleRemovePeer = ({ peer }) => {
      peers.current[peer] && peers.current[peer].close()
      delete peers.current[peer]
      delete peerMediaElements.current[peer]
    }

    socket.on(REMOVE_PEER, handleRemovePeer)

    return () => socket.off(REMOVE_PEER, handleRemovePeer)
    // eslint-disable-next-line
  }, [users])
}
