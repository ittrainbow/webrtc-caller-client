import { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch } from 'react-redux'

import { Router } from './router/Router'
import { appActions } from './redux/appSlice'

export const App = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(appActions.setMobile(isMobile))
    // eslint-disable-next-line
  }, [])

  return <Router />
}
