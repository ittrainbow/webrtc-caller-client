import { useState, useCallback, useRef, useEffect } from 'react'

export const useStateCB = (initialState) => {
  const [state, setState] = useState(initialState)
  const callbackRef = useRef(null)

  const updateState = useCallback((state, callback) => {
    callbackRef.current = callback
    setState((prevState) => (typeof state === 'function' ? state(prevState) : state))
  }, [])

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(state)
      callbackRef.current = null
    }
  }, [state])

  // const updateState = (state: any, callback: any) => {
  //   setState((prevState: any) => (typeof state === 'function' ? state(prevState) : state))
  //   callback(state)
  // }

  return [state, updateState]
}
