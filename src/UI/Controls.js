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
import { useSelector, useDispatch } from 'react-redux'
import { SET_BLANKED, SET_MUTED } from '../types'

export const Controls = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const url = 'ittr-multiuser-webrtc-call.web.app' + pathname
  const { userMediaElement } = useAppContext()
  const { blanked, muted, mobile } = useSelector((store) => store.app)

  const handleMicrophone = () => {
    const audio = userMediaElement.current?.getTracks().find((track) => track.kind === 'audio')
    dispatch({ type: SET_MUTED, payload: audio.enabled })
    audio.enabled = !audio.enabled
  }

  const handleCamera = () => {
    const video = userMediaElement.current?.getTracks().find((track) => track.kind === 'video')
    dispatch({ type: SET_BLANKED, payload: video.enabled })
    video.enabled = !video.enabled
  }

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
        <div className="controls-elements" style={{ flexDirection: mobile ? 'column' : 'row' }}>
          <Button variant="outlined" style={{ color: '#333', border: '1px solid #333' }} onClick={navigateHandler}>
            BACK TO ROOMS
          </Button>
          <div className="controls-buttons">
            <div className="controls-element" style={{ color: blanked ? 'darkred' : '#333' }} onClick={handleCamera}>
              {blanked ? <PiVideoCameraSlashDuotone /> : <PiVideoCameraDuotone />}
            </div>
            <div className="controls-element" style={{ color: muted ? 'darkred' : '#333' }} onClick={handleMicrophone}>
              {muted ? <PiMicrophoneSlashDuotone /> : <PiMicrophoneDuotone />}
            </div>
          </div>
          <Button variant="outlined" style={{ color: '#333', border: '1px solid #333' }} onClick={clipboardHandler}>
            COPY ROOM URL
          </Button>
        </div>
      </div>
    </>
  )
}
