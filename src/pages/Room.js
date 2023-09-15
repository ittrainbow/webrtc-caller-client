import { useEffect } from 'react'
import { useParams } from 'react-router'

import { useCamera, usePeers, useGrid } from '../hooks'
import { useAppContext } from '../context/Context'
import { Controls } from '../UI/Controls'
import { socket } from '../socket'
import { useSelector } from 'react-redux'
import { selectApp } from '../redux/selectors'

export const Room = () => {
  const { id } = useParams()
  const { cameraOn, cameraOff } = useCamera(id)
  const { mediaRef } = useAppContext()
  const { style, width, height } = useGrid()

  const { users } = useSelector(selectApp)

  usePeers(id)

  useEffect(() => {
    cameraOn()
    return () => cameraOff()
    // eslint-disable-next-line
  }, [])

  return (
    <div className="room-container">
      <div className="room-videos" style={style}>
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
