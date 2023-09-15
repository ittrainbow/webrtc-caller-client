import { call, select, take, put } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

import { socket } from '../socket'
import { appActions } from '../redux/appSlice'

const createChannel = (socket) => {
  return eventChannel((emit) => {
    const addPeerHandler = ({ peer }) => {
      emit(peer)
    }

    socket.on('add_peer', addPeerHandler)

    const unsubscribe = () => {}

    return unsubscribe
  })
}

function* updateUsersSaga(payload) {
  const { users } = yield select((store) => store.app)
  console.log(102, users)
  const newUsers = users.includes(payload) ? users : [...users, payload]
  console.log(103, newUsers)
  // yield put(appActions.setUsers(newUsers))
}

export function* usersSaga() {
  const sagaChannel = yield call(createChannel, socket)

  while (true) {
    const payload = yield take(sagaChannel)
    yield call(updateUsersSaga, payload)
  }
}
