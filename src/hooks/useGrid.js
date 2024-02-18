import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export const useGrid = () => {
  const [cols, setCols] = useState(1)
  const [rows, setRows] = useState(1)
  const [width, setWidth] = useState(320)
  const [height, setHeight] = useState(240)
  const { mobile, users } = useSelector((store) => store.app)

  useEffect(() => {
    switch (users?.length) {
      case 1:
        setCols(1)
        setRows(1)
        break

      case 2:
        setCols(2)
        setRows(1)
        break

      case 3:
      case 4:
        setCols(2)
        setRows(2)
        break

      case 5:
      case 6:
        setCols(3)
        setRows(2)
        break

      case 7:
      case 8:
      case 9:
        setCols(3)
        setRows(3)
        break

      default:
        break
    }
  }, [users])

  useEffect(() => {
    const number = users?.length
    const width = window.visualViewport.width
    const height = window.visualViewport.height - (mobile ? 0 : 50)

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
      case 5:
      case 6:
        setHeight(height * 0.45)
        setWidth(height * 0.45 * 1.33)
        break

      case 7:
      case 8:
      case 9:
        setHeight(height * 0.28)
        setWidth(height * 0.28 * 1.33)
        break

      default:
        break
    }
    // eslint-disable-next-line
  }, [users])

  const style = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridColumnGap: '5px',
    gridRowGap: '5px'
  }

  return { cols, rows, width, height, style }
}
