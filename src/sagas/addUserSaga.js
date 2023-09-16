import { call, take, put, delay } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

import { ADD_PEER, ADD_USER } from '../types'
import { socket } from '../socket'

const createChannel = (socket) => {
  return eventChannel((emit) => {
    const addPeerHandler = ({ peer }) => emit(peer)

    socket.on(ADD_PEER, addPeerHandler)

    return () => socket.off(ADD_PEER, addPeerHandler)
  })
}

function* updateSaga(payload) {
  yield delay(500)
  yield put({ type: ADD_USER, payload })
}

export function* addUserSaga() {
  const sagaChannel = yield call(createChannel, socket)

  while (true) {
    const payload = yield take(sagaChannel)
    yield call(updateSaga, payload)
  }
}
