import { useDispatch } from 'react-redux'
import { useAppContext } from '../context/Context'
import { socket } from '../socket'
import { ADD_USER, LEAVE_ROOM } from '../types'

export const useCamera = (room) => {
  const { userMediaElement, peerMediaElements, callbackRef } = useAppContext()
  const dispatch = useDispatch()

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

    callbackRef.current = addLocal
    dispatch({ type: ADD_USER, payload: socket.id })

    socket.emit('join_room', { room })
  }

  const cameraOff = () => {
    userMediaElement.current?.getTracks().forEach((track) => track.stop())
    socket.emit(LEAVE_ROOM)
  }

  return { cameraOn, cameraOff }
}
