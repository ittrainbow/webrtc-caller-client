import { useAppContext } from '../context/Context'
import { socket } from '../socket'

export const useCamera = (room) => {
  const { userMediaElement, peerMediaElements, addUser, stopUserMediaElementTracks } = useAppContext()

  const cameraOn = async () => {
    userMediaElement.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        channelCount: 2,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: false,
        sampleRate: 44100,
        sampleSize: 16,
        volume: 1.0
      },
      video: {
        width: 320,
        height: 240
      }
    })

    const addLocal = () => {
      peerMediaElements.current[socket.id].volume = 0
      peerMediaElements.current[socket.id].srcObject = userMediaElement.current
    }

    addUser(socket.id, addLocal)

    socket.emit('join_room', { room })
  }

  const cameraOff = () => {
    stopUserMediaElementTracks()
    socket.emit('leave_room')
  }

  return { cameraOn, cameraOff }
}
