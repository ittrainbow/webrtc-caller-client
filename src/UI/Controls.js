import { useState } from 'react'
import {
  PiVideoCameraDuotone,
  PiVideoCameraSlashDuotone,
  PiMicrophoneDuotone,
  PiMicrophoneSlashDuotone
} from 'react-icons/pi'
import { FaBars } from 'react-icons/fa'
import { ImCancelCircle } from 'react-icons/im'
import { Button } from '@mui/material'

import { useAppContext } from '../context/Context'
import { useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectApp } from '../toolkit/selectors'

export const Controls = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const url = 'ittr-multiuser-webrtc-call.web.app' + pathname
  const { handleCamera, handleMicrophone } = useAppContext()
  const { blanked, muted } = useSelector(selectApp)

  const navigateHandler = () => {
    navigate('/')
  }

  const clipboardHandler = () => {
    navigator.clipboard.writeText(url)
  }

  const openNavbarHandler = () => {
    setOpen(!open)
  }

  const button = open ? <ImCancelCircle /> : <FaBars />

  return (
    <>
      <div className="controls-button" onClick={openNavbarHandler}>
        {button}
      </div>
      <div className={open ? 'controls-container' : 'controls-container-hidden'}>
        <div className="controls-elements">
          <Button variant="outlined" style={{ color: '#333', border: '1px solid #333' }} onClick={navigateHandler}>
            BACK TO ROOMS
          </Button>
          <div className="controls-element" style={{ color: blanked ? 'darkred' : '#333' }} onClick={handleCamera}>
            {blanked ? <PiVideoCameraSlashDuotone /> : <PiVideoCameraDuotone />}
          </div>
          <div className="controls-element" style={{ color: muted ? 'darkred' : '#333' }} onClick={handleMicrophone}>
            {muted ? <PiMicrophoneSlashDuotone /> : <PiMicrophoneDuotone />}
          </div>
          <Button variant="outlined" style={{ color: '#333', border: '1px solid #333' }} onClick={clipboardHandler}>
            COPY ROOM URL
          </Button>
        </div>
      </div>
    </>
  )
}
