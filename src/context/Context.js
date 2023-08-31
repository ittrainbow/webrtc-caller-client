import { useContext, createContext, useRef, useState, useCallback, useEffect } from 'react'
import { isMobile } from 'react-device-detect'

export const Context = createContext()
export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [blanked, setBlanked] = useState(false)
  const [muted, setMuted] = useState(false)
  const [width, setWidth] = useState(320)
  const [height, setHeight] = useState(240)
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

  const mediaRef = ({ peer, node }) => {
    peerMediaElements.current[peer] = node
  }

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

  const handleMicrophone = () => {
    const audio = userMediaElement.current?.getTracks().find((track) => track.kind === 'audio')
    setMuted(audio.enabled)
    audio.enabled = !audio.enabled
  }

  const handleCamera = () => {
    const video = userMediaElement.current?.getTracks().find((track) => track.kind === 'video')
    setBlanked(video.enabled)
    video.enabled = !video.enabled
  }

  return (
    <Context.Provider
      value={{
        isMobile,
        peers,
        userMediaElement,
        stopUserMediaElementTracks,
        peerMediaElements,
        removePeer,
        mediaRef,
        users,
        setUsers,
        updateUsers,
        addUser,
        width,
        setWidth,
        height,
        setHeight,
        blanked,
        handleCamera,
        muted,
        handleMicrophone
      }}
    >
      {children}
    </Context.Provider>
  )
}
