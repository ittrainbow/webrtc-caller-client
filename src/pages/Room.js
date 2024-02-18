import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

import { useCamera, usePeers, useGrid } from '../hooks'
import { useAppContext } from '../context/Context'
import { Controls } from '../UI/Controls'
import { socket } from '../socket'

export const Room = () => {
  const { id } = useParams()
  const { cameraOn, cameraOff } = useCamera(id)
  const { peerMediaElements } = useAppContext()
  const { style, width, height } = useGrid()
  const { connected } = socket

  const { users } = useSelector((store) => store.app)

  usePeers(id)

  useEffect(() => {
    cameraOn()
    return () => cameraOff()
    // eslint-disable-next-line
  }, [connected])

  const mediaRef = ({ peer, node }) => {
    peerMediaElements.current[peer] = node
  }

  return (
    <div className="room-container">
      <div className="room-videos" style={style}>
        {!!users.length &&
          users.map((peer, index) => {
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
