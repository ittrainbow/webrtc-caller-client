import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  users: []
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUsers(state, action) {
      state.users = action.payload
    }
  }
})

export const appActions = appSlice.actions
