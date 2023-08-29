import ReactDOM from 'react-dom/client'

import { ContextProvider } from './context/Context'
import './index.scss'
import { App } from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
)
