import { useParams } from 'react-router'

import { useWebRTC } from '../hooks/useWebRTC'

export const Room = () => {
  const { id } = useParams()
  const { clients, provideMediaRef } = useWebRTC(id)

  return (
    <div className="room-container">
      {clients.map((clientID) => {
        return (
          <div key={clientID} id={clientID}>
            <video
              ref={(instance) => {
                provideMediaRef(clientID, instance)
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
