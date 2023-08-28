import { useEffect, useState, useRef } from 'react'
import { v4 } from 'uuid'
import { useNavigate } from 'react-router-dom'

import { socket } from '../socket'

export const Home = () => {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    socket.on('SHARE_ROOMS', ({ rooms = [] } = {}) => {
      if (containerRef.current) setRooms(rooms)
    })
  }, [])

  const handleJoinRoom = (room) => {
    navigate(`/room/${room}`)
  }

  const handleCreateRoom = () => {
    const newRoom = v4()
    navigate(`/room/${newRoom}`)
  }

  return (
    <div ref={containerRef}>
      <h3>Rooms list</h3>
      <div>
        {rooms.map((room) => (
          <div key={room} className="room-in-list">
            {room}
            <button onClick={() => handleJoinRoom(room)}>JOIN ROOM</button>
          </div>
        ))}
      </div>
      <button onClick={handleCreateRoom}>CREATE ROOM</button>
    </div>
  )
}
