import { useContext, createContext, useRef, useState, useCallback, useEffect } from 'react'

const Context = createContext()

export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const peers = useRef({})
  const callbackRef = useRef(null)
  const userMediaElement = useRef({})
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

  const [clients, setClients] = useState([])

  const updateClients = useCallback((newClients, callback) => {
    callbackRef.current = callback
    setClients(newClients)
  }, [])

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(clients)
      callbackRef.current = null
    }
  }, [clients])

  const addClient = useCallback(
    (newClient, callback) => {
      updateClients((clients) => {
        if (!clients.includes(newClient)) {
          return [...clients, newClient]
        }

        return clients
      }, callback)
    },
    [updateClients]
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
        setClients,
        updateClients,
        addClient
      }}
    >
      {children}
    </Context.Provider>
  )
}
