import { useContext, createContext, useRef, useState, useCallback, useEffect } from 'react'
import { appActions } from '../toolkit/appSlice'
import { useDispatch, useSelector } from 'react-redux'
import { selectApp } from '../toolkit/selectors'

export const Context = createContext()
export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const dispatch = useDispatch()
  const peerMediaElements = useRef({})
  const userMediaElement = useRef({})
  const callbackRef = useRef(null)
  const peers = useRef({})

  const { users } = useSelector(selectApp)

  const removePeer = (peer) => {
    peers.current[peer] && peers.current[peer].close()
    delete peers.current[peer]
    delete peerMediaElements.current[peer]
  }

  const mediaRef = ({ peer, node }) => {
    peerMediaElements.current[peer] = node
  }

  const updateUsers = useCallback((newUsers, callback) => {
    if (callback) {
      callbackRef.current = callback
    }
    dispatch(appActions.setUsers(newUsers))
  }, [])

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(users)
      callbackRef.current = null
    }
  }, [users])

  const handleMicrophone = () => {
    const audio = userMediaElement.current?.getTracks().find((track) => track.kind === 'audio')
    dispatch(appActions.setMuted(audio.enabled))
    audio.enabled = !audio.enabled
  }

  const handleCamera = () => {
    const video = userMediaElement.current?.getTracks().find((track) => track.kind === 'video')
    dispatch(appActions.setBlanked(video.enabled))
    video.enabled = !video.enabled
  }

  return (
    <Context.Provider
      value={{
        peers,
        userMediaElement,
        peerMediaElements,
        removePeer,
        mediaRef,
        updateUsers,
        handleCamera,
        handleMicrophone
      }}
    >
      {children}
    </Context.Provider>
  )
}
