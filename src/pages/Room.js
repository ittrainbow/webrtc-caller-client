import { useParams } from 'react-router'

import { usePeers } from '../hooks/usePeers'
import { useAppContext } from '../context/Context'

export const Room = () => {
  const { id } = useParams()
  const peers = usePeers(id)
  const { mediaRef, clients } = useAppContext()

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
