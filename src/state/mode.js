import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  mode: "dark",
}

// 세션 slice 생성
const modeSlice = createSlice({
  name: "mode",
  initialState,
  reducers: {
    setMode: (state, action) => {
      return action.payload
    },
    clearMode: (state) => {
      return null
    },
  },
})

export const { setMode, clearMode } = modeSlice.actions
export default modeSlice
