import { useAppContext } from '../context/Context'
import { socket } from '../socket'

export const useCamera = (room) => {
  const { userMediaElement, peerMediaElements, updateUsers, users } = useAppContext()

  const cameraOn = async () => {
    userMediaElement.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        channelCount: 2,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: false,
        sampleSize: 16,
        volume: 1.0
      },
      video: {
        width: 320,
        height: 240
      }
    })

    const { id } = socket

    const addLocal = () => {
      peerMediaElements.current[id].volume = 0
      peerMediaElements.current[id].srcObject = userMediaElement.current
    }

    updateUsers(users.includes(id) ? users : [...users, id], addLocal)

    socket.emit('join_room', { room })
  }

  const cameraOff = () => {
    userMediaElement.current?.getTracks().forEach((track) => track.stop())
    socket.emit('leave_room')
  }

  return { cameraOn, cameraOff }
}
