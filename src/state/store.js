import { configureStore } from "@reduxjs/toolkit"
import { soapApiReducer } from "state/api"
import sessionSlice from "./session"
import publicKeySlice from "./publickey"

const store = configureStore({
  reducer: {
    soapApi: soapApiReducer,
    session: sessionSlice.reducer,
    publicKey: publicKeySlice.reducer,
  },
})

export default store
