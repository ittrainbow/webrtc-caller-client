import { ADD_USER, LEAVE_ROOM, REMOVE_USER, RESET_USERS, SET_BLANKED, SET_MOBILE, SET_MUTED } from '../../types'

const initialState = {
  users: [],
  mobile: false,
  blanked: false,
  muted: false
}

export const appReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case ADD_USER:
      const newUsers = state.users.includes(payload) ? state.users : [...state.users, payload]
      return {
        ...state,
        users: newUsers
      }

    case REMOVE_USER:
      return {
        ...state,
        users: state.users.filter((user) => user !== payload)
      }

    case RESET_USERS:
      return {
        ...state,
        users: []
      }

    case SET_MOBILE:
      return {
        ...state,
        mobile: payload
      }

    case SET_BLANKED:
      return {
        ...state,
        blanked: payload
      }

    case SET_MUTED:
      return {
        ...state,
        muted: payload
      }

    case LEAVE_ROOM:
      return {
        ...state,
        users: []
      }

    default:
      return state
  }
}
