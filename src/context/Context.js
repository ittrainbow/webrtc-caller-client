import { useContext, createContext, useRef, useState, useCallback, useEffect } from 'react'

export const Context = createContext()
export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const peerMediaElements = useRef({})
  const userMediaElement = useRef({})
  const callbackRef = useRef(null)
  const peers = useRef({})

  const stopUserMediaElementTracks = () => {
    userMediaElement.current?.getTracks().forEach((track) => track.stop())
  }

  const removePeer = (peer) => {
    peers.current[peer] && peers.current[peer].close()
    delete peers.current[peer]
    delete peerMediaElements.current[peer]
  }

  const mediaRef = (id, node) => (peerMediaElements.current[id] = node)

  const updateUsers = useCallback((newUsers, callback) => {
    callbackRef.current = callback
    setUsers(newUsers)
  }, [])

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(users)
      callbackRef.current = null
    }
  }, [users])

  const addUser = (newUser, callback) => {
    updateUsers((users) => {
      return users.includes(newUser) ? users : [...users, newUser]
    }, callback)
  }

  return (
    <Context.Provider
      value={{
        peers,
        userMediaElement,
        stopUserMediaElementTracks,
        peerMediaElements,
        removePeer,
        mediaRef,
        users,
        setUsers,
        updateUsers,
        addUser
      }}
    >
      {children}
    </Context.Provider>
  )
}
