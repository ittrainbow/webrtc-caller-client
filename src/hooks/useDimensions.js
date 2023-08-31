import { useEffect } from 'react'
import { useAppContext } from '../context/Context'

export const useDimensions = () => {
  const { users, setWidth, setHeight, isMobile } = useAppContext()

  useEffect(() => {
    const number = users?.length
    const width = window.visualViewport.width
    const height = window.visualViewport.height - (isMobile ? 0 : 50)

    switch (number) {
      case 1:
        setHeight(height * 0.8)
        setWidth(height * 0.8 * 1.33)
        break

      case 2:
        setWidth(width * 0.45)
        setHeight(width * 0.45 * 0.75)
        break

      case 3:
      case 4:
        setHeight(height * 0.45)
        setWidth(height * 0.45 * 1.33)
        break

      case 5:
      case 6:
        setWidth(width * 0.3)
        setHeight(width * 0.3 * 1.33)
        break

      case 7:
      case 8:
      case 9:
        setHeight(height * 0.3)
        setWidth(height * 0.3 * 1.33)
        break

      default:
        break
    }
    // eslint-disable-next-line
  }, [users])
}
