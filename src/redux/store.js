import { combineReducers, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import { rootSaga } from '../sagas/rootSaga'
import { appSlice } from './appSlice'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: combineReducers({
    app: appSlice.reducer
  }),
  middleware: [sagaMiddleware],
  devTools: process.env.NODE_ENV === 'development'
})

sagaMiddleware.run(rootSaga)
