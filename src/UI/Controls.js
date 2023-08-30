import {
  PiVideoCameraDuotone,
  PiVideoCameraSlashDuotone,
  PiMicrophoneDuotone,
  PiMicrophoneSlashDuotone
} from 'react-icons/pi'
import { useAppContext } from '../context/Context'

export const Controls = () => {
  const { blanked, handleCamera, muted, handleMicrophone } = useAppContext()

  return (
    <div className="controls-container">
      <div className="controls-element" style={{ color: blanked ? 'darkred' : 'green' }} onClick={handleCamera}>
        {blanked ? <PiVideoCameraSlashDuotone /> : <PiVideoCameraDuotone />}
      </div>
      <div className="controls-element" style={{ color: muted ? 'darkred' : 'green' }} onClick={handleMicrophone}>
        {muted ? <PiMicrophoneSlashDuotone /> : <PiMicrophoneDuotone />}
      </div>
    </div>
  )
}
