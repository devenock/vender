import { createSlice, type Slice } from '@reduxjs/toolkit'

interface User {
  firstName: string
  lastName: string
  password: string
  email: string
}
interface InitialState {
  isLoggedIn: boolean
  isRegistered: boolean
  users: User[]
  user: User
}

// declare initial state
const initialState: InitialState = {
  isLoggedIn: false,
  isRegistered: false,
  users: [],
  user: { firstName: '', lastName: '', password: '', email: '' }
}

// create the auth slice
const authSlice: Slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateLoginStatus: (state: InitialState, action: { payload: any, type: string }): void => {
      state.isLoggedIn = action.payload
    },
    updateRegisterStatus: (state: InitialState, action: { payload: any, type: string }): void => {
      state.isRegistered = action.payload
    },
    addUser: (state: InitialState, action: { payload: any, type: string }): void => {
      state.users = action.payload
    },
    updateUserDetails: (state: InitialState, action: { payload: any, type: string }) => {
      state.user.firstName = action.payload.firstName
      state.user.lastName = action.payload.lastName
      state.user.password = action.payload.password
      state.user.email = action.payload.email
    }
  }
})

export const { updateLoginStatus, updateRegisterStatus, addUser } = authSlice.actions
export default authSlice.reducer
