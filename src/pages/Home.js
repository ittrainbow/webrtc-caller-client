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

  const handleJoinRoom = (roomID) => {
    navigate(`/room/${roomID}`)
  }

  const handleCreateRoom = () => {
    const newRoomID = v4()
    navigate(`/room/${newRoomID}`)
  }

  return (
    <div ref={containerRef}>
      <h3>Rooms list</h3>
      <div>
        {rooms.map((roomID) => (
          <div key={roomID} className="room-in-list">
            {roomID}
            <button onClick={() => handleJoinRoom(roomID)}>JOIN ROOM</button>
          </div>
        ))}
      </div>
      <button onClick={handleCreateRoom}>CREATE ROOM</button>
    </div>
  )
}
