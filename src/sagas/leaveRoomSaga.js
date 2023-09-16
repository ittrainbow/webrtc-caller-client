import { call, take, put } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

import { LEAVE_ROOM, RESET_USERS } from '../types'
import { socket } from '../socket'

const createChannel = (socket) => {
  return eventChannel((emit) => {
    const leaveRoomHandler = () => emit()

    socket.on(LEAVE_ROOM, leaveRoomHandler)

    return () => socket.off(LEAVE_ROOM, leaveRoomHandler)
  })
}

function* updateSaga() {
  yield put({ type: RESET_USERS })
}

export function* leaveRoomSaga() {
  const sagaChannel = yield call(createChannel, socket)

  while (true) {
    yield take(sagaChannel)
    yield call(updateSaga)
  }
}
