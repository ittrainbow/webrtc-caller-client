import { useEffect } from 'react'
import { useParams } from 'react-router'

import { useAppContext } from '../context/Context'
import { useCamera, usePeers } from '../hooks'

export const Room = () => {
  const { id } = useParams()
  const { cameraOn, cameraOff } = useCamera(id)
  const { mediaRef, clients } = useAppContext()

  usePeers(id)

  useEffect(() => {
    cameraOn()
    return () => cameraOff()
    // eslint-disable-next-line
  }, [id])

  return (
    <div className="room-container">
      {clients.map((peer) => {
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
