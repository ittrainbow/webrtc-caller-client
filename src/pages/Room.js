import { useParams } from 'react-router'

import { usePeers } from '../hooks/usePeers'
import { useAppContext } from '../context/Context'

export const Room = () => {
  const { id } = useParams()
  const peerlist = usePeers(id)
  const { mediaRef } = useAppContext()

  return (
    <div className="room-container">
      {peerlist.map((peer) => {
        return (
          <div key={peer} id={peer}>
            <video
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
