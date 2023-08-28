import { useContext, createContext, useRef, useCallback } from 'react'
import useStateWithCallback from '../hooks/useStateWithCallback'

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

  const [clients, updateClients] = useStateWithCallback([])
  
  const addClient = useCallback(
    (newClient, callback) => {
      updateClients((clients) => {
        if (!clients.includes(newClient)) {
          return [...clients, newClient]
        }

        return clients
      }, callback)
    },
    [clients, updateClients]
  )

  return (
    <Context.Provider
      value={{
        peers,
        userMediaElement,
        stopUserMediaElementTracks,
        peerMediaElements,
        removePeer,
        mediaRef,
        clients,
        updateClients,
        addClient
      }}
    >
      {children}
    </Context.Provider>
  )
}
