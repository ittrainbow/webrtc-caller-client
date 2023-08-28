import { useContext, createContext, useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router'
const Context = createContext()

export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const location = useLocation()
  const [room, setRoom] = useState(null)

  const peerConnections = useRef({})
  const localMediaStream = useRef(null)
  const peerMediaElements = useRef({ ['localStream']: null })

  useEffect(() => {
    const { pathname } = location
    const id = pathname.split('/').slice(-1)[0]
    const room = !!id.length ? id : null
    setRoom(room)
  }, [location])

  return (
    <Context.Provider value={{ room, peerConnections, localMediaStream, peerMediaElements }}>
      {children}
    </Context.Provider>
  )
}
