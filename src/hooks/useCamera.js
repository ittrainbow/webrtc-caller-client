import { useCallback, useEffect } from 'react'

import { videoParams } from '../helpers/mediaParams'
import { useAppContext } from '../context/Context'
import { socket } from '../socket'
import useStateWithCallback from './useStateWithCallback'

export const useCamera = () => {
  const { room, userMediaElement, clearUserMediaElement, peerMediaElements } = useAppContext()
  const [clients, updateClients] = useStateWithCallback([])

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

  const stopCapture = async () => {
    await clearUserMediaElement()
    socket.emit('LEAVE_ROOM')
  }

  return { clients, startCapture, stopCapture }
}
