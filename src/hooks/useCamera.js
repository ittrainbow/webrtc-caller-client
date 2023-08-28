import { useAppContext } from '../context/Context'
import { socket } from '../socket'

export const useCamera = (room) => {
  const { userMediaElement, peerMediaElements, addClient, stopUserMediaElementTracks } = useAppContext()

  const cameraOn = async () => {
    userMediaElement.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 320,
        height: 240
      }
    })

    const addLocal = () => {
      peerMediaElements.current[socket.id].volume = 0
      peerMediaElements.current[socket.id].srcObject = userMediaElement.current
    }
    
    addClient(socket.id, addLocal)

    socket.emit('join_room', { room })
  }

  const cameraOff = () => {
    stopUserMediaElementTracks()
    socket.emit('leave_room')
  }

  return { cameraOn, cameraOff }
}
