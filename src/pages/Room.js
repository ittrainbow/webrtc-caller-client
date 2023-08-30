import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
// import { PiMicrophoneDuotone, PiMicrophoneSlashDuotone } from 'react-icons/pi'

import { useAppContext } from '../context/Context'
import { socket } from '../socket'
import { useCamera, usePeers } from '../hooks'
import { Controls } from '../UI/Controls'
import { Button } from '@mui/material'

export const Room = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { mediaRef, users } = useAppContext()

  const id = pathname.split('/').slice(-1)[0]
  const url = 'localhost:3000' + pathname
  const { cameraOn, cameraOff } = useCamera(id)
  usePeers(id)

  useEffect(() => {
    cameraOn()
    return () => cameraOff()
    // eslint-disable-next-line
  }, [])

  const navigateHandler = () => {
    navigate('/')
  }

  const clipboardHandler = () => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="room-container">
      <div className="room-videos">
        {users.map((peer) => {
          const ref = (node) => mediaRef({ peer, node })

          return (
            <div key={peer} id={peer}>
              <video className="room-video" ref={ref} autoPlay playsInline muted={peer === socket.id} />
              <div>
                {/* {audioEnabled !== false ? <PiMicrophoneDuotone size={32} /> : <PiMicrophoneSlashDuotone size={32} />} */}
              </div>
            </div>
          )
        })}
      </div>
      <div className="room-bottom">
        <Button variant="contained" onClick={navigateHandler}>
          BACK TO ROOMS
        </Button>
        <Controls />
        <Button variant="contained" onClick={clipboardHandler}>
          COPY ROOM URL
        </Button>
      </div>
    </div>
  )
}
