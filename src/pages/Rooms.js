import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { socket } from '../socket'

export const Rooms = () => {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    socket.on('share_rooms', ({ rooms = [] } = {}) => {
      if (containerRef.current) {
        setRooms(rooms)
      }
    })
  }, [])

  const handleJoinRoom = (room) => {
    navigate(`/room/${room}`)
  }

  const handleCreateRoom = () => {
    const newRoom = new Date().getTime()
    navigate(`/room/${newRoom}`)
  }

  return (
    <div ref={containerRef} className="container">
      <div className="rooms-top">
        <div className="header">Rooms list</div>
        {rooms.map((room) => (
          <Button key={room} variant="contained" className="button" onClick={() => handleJoinRoom(room)}>
            JOIN {room}
          </Button>
        ))}
        <Button variant="contained" className="button" onClick={handleCreateRoom}>
          CREATE ROOM
        </Button>
      </div>
    </div>
  )
}
