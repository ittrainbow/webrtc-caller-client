import { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch } from 'react-redux'

import { Router } from './router/Router'
import { SET_MOBILE } from './types'

export const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({ type: SET_MOBILE, payload: isMobile })
    // eslint-disable-next-line
  }, [])

  return <Router />
}
