import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "lib/axios"
import { config } from "config"

const initialState = {
  loading: false,
  error: null,
  data: null,
}

export const fetchSoapData = createAsyncThunk(
  "soapApi/fetchSoapData",
  async (payload, { rejectWithValue }) => {
    const {
      authKeyEncD,
      sessionIDEncN,
      userOid,
      deviceIdEncN,
      inputJSON,
      mode,
    } = payload
    const requestBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetValetDataJSON xmlns="http://tempuri.org/">
            <AuthKeyEncD>${authKeyEncD}</AuthKeyEncD>
            <SessionIDEncN>${sessionIDEncN}</SessionIDEncN>
            <UserOid>${userOid}</UserOid>
            <DeviceIdEncN>${deviceIdEncN}</DeviceIdEncN>
            <InputJSON>${inputJSON}</InputJSON>
            <Mode>${mode}</Mode>
          </GetValetDataJSON>
        </soap:Body>
      </soap:Envelope>`

    try {
      const response = await axios.post(
        `${config.api}/webservices/GeneralService.asmx`,
        requestBody,
        {
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/GetValetDataJSON",
          },
        }
      )

      return response
    } catch (error) {
      if (error.response?.status === 403) {
        // Handle CORS error
        return rejectWithValue("CORS error")
      }
      // Handle other errors
      return rejectWithValue(error.message)
    }
  }
)

const soapApiSlice = createSlice({
  name: "soapApi",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSoapData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSoapData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchSoapData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const soapApiReducer = soapApiSlice.reducer
export default soapApiSlice.actions
