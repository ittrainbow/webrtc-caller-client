import { useEffect } from 'react'
import { useParams } from 'react-router'

import { useAppContext } from '../context/Context'
import { useCamera, useDimensions, usePeers } from '../hooks'
import { socket } from '../socket'
import { Controls } from '../UI/Controls'

export const Room = () => {
  const { id } = useParams()
  const { cameraOn, cameraOff } = useCamera(id)
  const { mediaRef, users, width, height } = useAppContext()

  usePeers(id)

  useEffect(() => {
    cameraOn()
    return () => cameraOff()
    // eslint-disable-next-line
  }, [])

  useDimensions()

  return (
    <div className="room-container">
      <div className="room-videos">
        {users.map((peer, index) => {
          const ref = (node) => mediaRef({ peer, node })

          return (
            <div key={index} id={peer}>
              <video
                className="room-video"
                width={width}
                height={height}
                ref={ref}
                autoPlay
                playsInline
                muted={peer === socket.id}
              />
            </div>
          )
        })}
      </div>
      <Controls />
    </div>
  )
}
