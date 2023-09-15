import { spawn, call, all } from 'redux-saga/effects'

import { addUserSaga, removeUserSaga, leaveRoomSaga } from '.'

export function* rootSaga() {
  const sagas = [addUserSaga, removeUserSaga, leaveRoomSaga]
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
