import { videoParams } from '../helpers/mediaParams'
import { socket } from '../socket'

import { useAppContext } from '../context/Context'

export const useCamera = (room) => {
  const { userMediaElement, peerMediaElements, addClient, stopUserMediaElementTracks } = useAppContext()

  const cameraOn = async () => {
    userMediaElement.current = await navigator.mediaDevices.getUserMedia(videoParams)
    const addLocal = () => {
      peerMediaElements.current[socket.id].volume = 0
      peerMediaElements.current[socket.id].srcObject = userMediaElement.current
    }
    addClient(socket.id, addLocal)

    socket.emit('JOIN_ROOM', { room })
  }

  const cameraOff = () => {
    stopUserMediaElementTracks()
    socket.emit('LEAVE_ROOM')
  }

  return { cameraOn, cameraOff }
}
