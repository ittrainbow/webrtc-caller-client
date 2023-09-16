import { useContext, createContext, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'

export const Context = createContext()
export const useAppContext = () => useContext(Context)

export const ContextProvider = ({ children }) => {
  const peers = useRef({})
  const userMediaElement = useRef({})
  const peerMediaElements = useRef({})
  const callbackRef = useRef()

  const { users } = useSelector((store) => store.app)

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(users)
      callbackRef.current = null
    }
  }, [users])

  return (
    <Context.Provider
      value={{
        peers,
        userMediaElement,
        peerMediaElements,
        callbackRef
      }}
    >
      {children}
    </Context.Provider>
  )
}
