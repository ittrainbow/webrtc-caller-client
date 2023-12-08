import { call, take, put } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

import { REMOVE_PEER, REMOVE_USER } from '../types'
import { socket } from '../socket'

const createChannel = (socket) => {
  return eventChannel((emit) => {
    const removePeerHandler = ({ peer }) => emit(peer)

    socket.on(REMOVE_PEER, removePeerHandler)

    return () => socket.off(REMOVE_PEER, removePeerHandler)
  })
}

function* updateSaga(payload) {
  yield put({ type: REMOVE_USER, payload })
}

export function* removeUserSaga() {
  const sagaChannel = yield call(createChannel, socket)

  while (true) {
    const payload = yield take(sagaChannel)
    yield call(updateSaga, payload)
  }
}
