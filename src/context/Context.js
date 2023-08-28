import { useContext, createContext, useEffect, useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router'
const Context = createContext()

export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const location = useLocation()
  const [room, setRoom] = useState(null)

  const peers = useRef({})
  const userMediaElement = useRef(null)
  const peerMediaElements = useRef({ ['localStream']: null })

  const stopUserMediaElementTracks = () => {
    userMediaElement.current?.getTracks().forEach((track) => track.stop())
  }

  const removePeer = (peer) => {
    peers.current[peer] && peers.current[peer].close()
    delete peers.current[peer]
    delete peerMediaElements.current[peer]
  }

  const mediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node
  }, [])

  useEffect(() => {
    const { pathname } = location
    const id = pathname.split('/').slice(-1)[0]
    const room = !!id.length ? id : null
    setRoom(room)
  }, [location])

  return (
    <Context.Provider
      value={{ room, peers, userMediaElement, stopUserMediaElementTracks, peerMediaElements, removePeer, mediaRef }}
    >
      {children}
    </Context.Provider>
  )
}
