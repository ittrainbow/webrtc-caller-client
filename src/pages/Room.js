import { useEffect } from 'react'
import { useParams } from 'react-router'

import { useAppContext } from '../context/Context'
import { useCamera, usePeers } from '../hooks'

export const Room = () => {
  const { id } = useParams()
  const { cameraOn, cameraOff } = useCamera(id)
  const { mediaRef, users } = useAppContext()

  usePeers(id)

  useEffect(() => {
    cameraOn()
    return () => cameraOff()
    // eslint-disable-next-line
  }, [])

  return (
    <div className="room-container">
      {users.map((peer) => {
        return (
          <div key={peer} id={peer}>
            <video
              className="room-video"
              ref={(instance) => {
                mediaRef(peer, instance)
              }}
              autoPlay
              playsInline
              muted={peer === 'localStream'}
            />
          </div>
        )
      })}
    </div>
  )
}
