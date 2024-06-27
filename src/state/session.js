import { createSlice } from "@reduxjs/toolkit"

// 세션 slice 생성
const sessionSlice = createSlice({
  name: "session",
  initialState: null,
  reducers: {
    setSession: (state, action) => {
      return action.payload
    },
    clearSession: (state) => {
      return null
    },
  },
})

export const { setSession, clearSession } = sessionSlice.actions
export default sessionSlice
