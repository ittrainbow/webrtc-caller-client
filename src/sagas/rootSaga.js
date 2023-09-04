import { spawn, call, all } from 'redux-saga/effects'

import { appSaga } from './appSagas'

export function* rootSaga() {
  const sagas = [appSaga]
  const retrySagas = sagas.map((saga) => {
    return spawn(function* () {
      while (true) {
        try {
          yield call(saga)
          break
        } catch (error) {
          console.error(error)
        }
      }
    })
  })

  yield all(retrySagas)
}
