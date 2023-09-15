import { spawn, call, all } from 'redux-saga/effects'

import { appSaga } from './appSagas'
import { usersSaga } from './usersSaga'

export function* rootSaga() {
  const sagas = [appSaga, usersSaga]
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
