import { useRef, useState, useEffect, useCallback } from 'react'
import freeice from 'freeice'

import { useStateCB } from './useStateCB'
import { socket } from '../socket'
import { iceServers } from '../helpers/servers'

export const useRTC = (roomID) => {
  const [clients, updateClients] = useStateCB([])
  const peerConnections = useRef({})
  const localMediaStream = useRef({})
  const peerMediaElements = useRef({ ['LOCAL_VIDEO']: null })

  const addNewClient = useCallback(
    (newClient, callback) => {
      if (!clients.includes(newClient)) {
        updateClients((list = []) => [...list, newClient], callback)
      }
    },
    [clients, updateClients]
  )

  useEffect(() => {
    const startCapture = async () => {
      console.log('startCapture')
      // get media data from the browser (check permission if necessary)
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })

      addNewClient('LOCAL_VIDEO', () => {
        console.log('addLocalVideoElement')
        const localVideoElement = peerMediaElements.current['LOCAL_VIDEO']

        if (localVideoElement) {
          // mute muself
          localVideoElement.volume = 0
          // broadcast my webcam to browser
          localVideoElement.srcObject = localMediaStream.current
        }
      })
    }

    const stopCapture = async () => {
      console.log('stopCapture')

      localMediaStream.current?.getTracks().forEach((track) => track.stop())
      socket.emit('LEAVE_ROOM')
    }

    startCapture()
      .then(() => socket.emit('JOIN_ROOM', { roomID }))
      .catch((error) => console.error(error))

    return () => stopCapture()
  }, [roomID])

  useEffect(() => {
    const handleNewPeer = async ({ peerID, shouldCreateOffer }) => {
      console.log('handleNewPeer')
      // if peer already in current peerConnections
      if (peerID in peerConnections.current) {
        return console.error(`already connected to peer ${peerID}`)
      }

      // else
      console.log('new peer connection')
      peerConnections.current[peerID] = new RTCPeerConnection({
        // iceServers
        iceServers: freeice()
      })

      // handle new candidate connection on offer or answer
      peerConnections.current[peerID].onicecandidate = (e) => {
        const iceCandidate = e.candidate
        if (iceCandidate) {
          // send candidate to clients
          socket.emit('RELAY_ICECANDIDATE', {
            peerID,
            iceCandidate
          })
        }
      }

      let tracksNumber = 0

      // if new track received getting media tracks
      peerConnections.current[peerID].ontrack = ({ streams: [remoteStream] }) => {
        tracksNumber++

        // case if we received video and audio
        if (tracksNumber === 2) {
          addNewClient(peerID, () => {
            // set remote stream as peer media element src
            peerMediaElements.current[peerID].srcObject = remoteStream
          })
        }
      }

      // get tracks from local stream and add them to peer connection
      localMediaStream.current?.getTracks().forEach((track) => {
        peerConnections.current[peerID].addTrack(track, localMediaStream.current)
      })

      // if we creating offer then add local description to current peer
      if (shouldCreateOffer) {
        const sessionDescription = await peerConnections.current[peerID].createOffer()

        // triggers onicecandidate with my local tracks
        await peerConnections.current[peerID].setLocalDescription(sessionDescription)

        socket.emit('RELAY_LOCALDESC', {
          peerID,
          sessionDescription
        })
      }
    }

    socket.on('ADD_PEER', handleNewPeer)
  }, [])

  useEffect(() => {
    const handleRemoteMedia = async ({ peerID, sessionDescription: remoteDescription }) => {
      console.log('handleRemoteMedia')
      await peerConnections.current[peerID].setRemoteDescription(new RTCSessionDescription(remoteDescription))

      if (remoteDescription.type === 'offer') {
        // if offer should create answer
        const answer = await peerConnections.current[peerID].createAnswer()

        // set answer as local description
        await peerConnections.current[peerID].setLocalDescription(answer)

        socket.emit('RELAY_LOCALDESC', {
          peerID,
          sessionDescription: answer
        })
      }
    }

    socket.on('SESSION_DESCRIPTION', handleRemoteMedia)
  }, [])

  useEffect(() => {
    const handleIceCandidate = ({ peerID, iceCandidate }) => {
      console.log('handleIceCandidate')
      // add iceCandidate to peer connections
      peerConnections.current[peerID].addIceCandidate(new RTCIceCandidate(iceCandidate))
    }

    socket.on('ICE_CANDIDATE', handleIceCandidate)
  }, [])

  useEffect(() => {
    const handleRemovePeer = ({ peerID }) => {
      console.log('handleRemovePeer')
      // if got local => close local
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close()
      }

      // clean up peer connections
      delete peerConnections.current[peerID]
      delete peerMediaElements.current[peerID]
      updateClients((list) => list.filter((client) => client !== peerID))
    }

    socket.on('REMOVE_PEER', handleRemovePeer)
  }, [])

  const provideMediaRef = useCallback((id, node) => (peerMediaElements.current[id] = node), [])

  return { clients, provideMediaRef }
}
