import { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch } from 'react-redux'

import { Router } from './router/Router'
import { appActions } from './toolkit/appSlice'

export const App = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(appActions.setMobile(isMobile))
  }, [])

  return <Router />
}
