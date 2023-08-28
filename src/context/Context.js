import { useContext, createContext, useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router'
const Context = createContext()

export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const location = useLocation()
  const [roomID, setRoomID] = useState(null)

  const peerConnections = useRef({})
  const localMediaStream = useRef(null)
  const peerMediaElements = useRef({
    ['localStream']: null
  })

  useEffect(() => {
    const { pathname } = location
    const id = pathname.split('/').slice(-1)[0]
    const roomID = !!id.length ? id : null
    setRoomID(roomID)
  }, [location])

  return (
    <Context.Provider value={{ roomID, peerConnections, localMediaStream, peerMediaElements }}>
      {children}
    </Context.Provider>
  )
}
