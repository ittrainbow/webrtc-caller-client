import { useParams } from 'react-router'

import { useWebRTC } from '../hooks/useWebRTC'
import { useAppContext } from '../context/Context'

export const Room = () => {
  const { id } = useParams()
  const { clients } = useWebRTC(id)
  const { mediaRef } = useAppContext()

  return (
    <div className="room-container">
      {clients.map((clientID) => {
        return (
          <div key={clientID} id={clientID}>
            <video
              ref={(instance) => {
                mediaRef(clientID, instance)
              }}
              autoPlay
              playsInline
              muted={clientID === 'localStream'}
            />
          </div>
        )
      })}
    </div>
  )
}
