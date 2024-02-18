import { io } from 'socket.io-client'

const options = {
  'force new connection': true,
  reconnectionAttempts: 'Infinity',
  timeout: 10000,
  transports: ['websocket']
}

// export const socket = io.connect('localhost:5001', options)
export const socket = io.connect('https://webrtc-caller-server-production.up.railway.app/', options)
