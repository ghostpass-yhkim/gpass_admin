import { createSlice } from "@reduxjs/toolkit"

// 세션 slice 생성
const publicKeySlice = createSlice({
  name: "publicKey",
  initialState: null,
  reducers: {
    setPublicKey: (state, action) => {
      return action.payload
    },
    clearPublicKey: (state) => {
      return null
    },
  },
})

export const { setPublicKey, clearPublicKey } = publicKeySlice.actions
export default publicKeySlice
