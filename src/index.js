import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import { ContextProvider } from './context/Context'
import './index.scss'
import { App } from './App'
import { store } from './redux/store'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <ContextProvider>
      <App />
    </ContextProvider>
  </Provider>
)
