import { useContext, createContext, useRef } from 'react'

const Context = createContext()

export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const peers = useRef({})
  const userMediaElement = useRef({})
  // const peerMediaElements = useRef({ ['localStream']: null })
  const peerMediaElements = useRef({})

  const stopUserMediaElementTracks = () => {
    userMediaElement.current?.getTracks().forEach((track) => track.stop())
  }

  const removePeer = (peer) => {
    peers.current[peer] && peers.current[peer].close()
    delete peers.current[peer]
    delete peerMediaElements.current[peer]
  }

  const mediaRef = (id, node) => (peerMediaElements.current[id] = node)

  return (
    <Context.Provider
      value={{
        peers,
        userMediaElement,
        stopUserMediaElementTracks,
        peerMediaElements,
        removePeer,
        mediaRef
      }}
    >
      {children}
    </Context.Provider>
  )
}
