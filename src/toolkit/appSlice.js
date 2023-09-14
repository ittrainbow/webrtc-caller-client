import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  users: [],
  mobile: false,
  blanked: false,
  muted: false
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUsers(state, action) {
      state.users = action.payload
    },

    setMobile(state, action) {
      state.mobile = action.payload
    },

    setBlanked(state, action) {
      state.blanked = action.payload
    },

    setMuted(state, action) {
      state.muted = action.payload
    }
  }
})

export const appActions = appSlice.actions
