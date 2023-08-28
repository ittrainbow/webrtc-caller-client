import { useState, useRef, useEffect } from 'react'

export const useStateWithCallback = () => {
  const [state, setState] = useState([])
  const callbackRef = useRef(null)

  const updateState = (newState, callback) => {
    callbackRef.current = callback
    setState(newState)
  }

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(state)
      callbackRef.current = null
    }
  }, [state])

  return [state, updateState]
}
