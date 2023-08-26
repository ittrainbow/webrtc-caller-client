import { useEffect } from 'react'
import { useParams } from 'react-router'

import { socket } from '../socket'
import { useRTC } from '../hooks/useRTC'

export const Room = () => {
  const { id: roomID } = useParams()
  const { clients, provideMediaRef } = useRTC(roomID || '')

  useEffect(() => {
    socket.emit('JOIN_ROOM', { roomID })
  }, [roomID])

  return (
    <div>
      Room
      <div>
        {clients.map((client) => {
          return (
            <video
              ref={(instance) => {
                provideMediaRef(client, instance)
              }}
              key={client}
              autoPlay
              playsInline
              muted={client === 'LOCAL_VIDEO'}
            />
          )
        })}
      </div>
    </div>
  )
}
