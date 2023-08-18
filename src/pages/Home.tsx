import { useEffect, useState } from 'react'
import { v4 } from 'uuid'
import { useNavigate } from 'react-router-dom'

import { socket } from '../socket'

export const Home = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    socket.on('SHARE_ROOMS', ({ rooms }) => {
      setRooms(rooms)
    })
  }, [])

  const handleJoinRoom = (roomID: string) => {
    navigate(`/room/${roomID}`)
  }

  const handleCreateRoom = () => {
    const newRoomID = v4()
    navigate(`/room/${newRoomID}`)
  }

  return (
    <>
      <div>Rooms list</div>
      <div>
        {rooms.map((roomID) => (
          <div key={roomID} className="room-in-list">
            {roomID}
            <button onClick={() => handleJoinRoom(roomID)}>JOIN ROOM</button>
          </div>
        ))}
      </div>
      <button onClick={handleCreateRoom}>CREATE ROOM</button>
    </>
  )
}
