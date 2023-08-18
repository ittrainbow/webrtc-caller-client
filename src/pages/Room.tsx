import { useEffect } from 'react'
import { useParams } from 'react-router'

export const Room = () => {
  const { id: roomID } = useParams()
  console.log(101, roomID)
  useEffect(() => {}, [])

  return <div>Room</div>
}
