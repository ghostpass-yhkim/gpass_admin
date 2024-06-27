import React, { useState, useEffect } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  useTheme,
  MenuItem,
} from "@mui/material"
import Header from "components/Header"
import store from "state/store"
import encrypt from "lib/encryption"
import axios from "axios"
import utill from "lib/utill"
import { config } from "config"

const UpdateUserFacial = () => {
  const theme = useTheme()

  const [rows, setRows] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone_num: "",
    location_name: "",
    name: "",
    note: "",
  })

  const [locationOptions, setLocationOptions] = useState([])
  const [hostLocationOID, setHostLocationOID] = useState("0")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const authKeyEncD = encrypt(
    process.env.REACT_APP_AUTH_KEY,
    process.env.REACT_APP_PUBLIC_KEY
  )

  useEffect(() => {
    getKioskList()
  }, [])

  const getKioskList = async () => {
    const url = `${config.api}/webservices/GeneralService.asmx`
    const bodyJson = {
      request: {
        page_no: 1,
        name: "",
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      SessionIDEncN: store.getState().session,
      AdminOid: utill.base64Decode(sessionStorage.getItem("x-a-d-a") ?? ""),
      InputJSON: JSON.stringify(bodyJson),
      Mode: "GET_HOST_KIOSK_LIST",
    }
    const headers = {
      "Content-Type": "text/xml;charset=UTF-8",
      soapAction: "http://tempuri.org/GetAdminDataJSON",
    }
    const requestBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetAdminDataJSON xmlns="http://tempuri.org/">
            <AuthKeyEncD>${body.AuthKeyEncD}</AuthKeyEncD>
            <SessionIDEncN>${body.SessionIDEncN}</SessionIDEncN>
            <AdminOid>${body.AdminOid}</AdminOid>
            <InputJSON>${body.InputJSON}</InputJSON>
            <Mode>${body.Mode}</Mode>
          </GetAdminDataJSON>
        </soap:Body>
      </soap:Envelope>`

    try {
      setIsLoading(true)
      const response = await axios.post(url, requestBody, {
        headers,
      })

      setIsLoading(false)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, "text/xml")

      const resultNode = xmlDoc.getElementsByTagName("Result")[0]
      const resultText = resultNode.textContent
      const resultObject = JSON.parse(resultText)

      if (resultObject.Result != null) {
        const result = resultObject.Result
        const resultCode = resultObject.ResultCode

        if (result === "+OK") {
          setRowCount(resultObject.Total)
          setRows(resultObject.Item)
          setLocationOptions(resultObject.Item)
        } else {
          console.log("에러1")
        }
      } else {
        console.log("에러1")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleLocationChange = (e) => {
    const { value } = e.target
    const selectedLocation = locationOptions.find(
      (option) => option.location_name === value
    )

    setFormData((prevData) => ({
      ...prevData,
      location_name: value,
    }))

    if (selectedLocation) {
      setHostLocationOID(selectedLocation.host_location_oid)
    } else {
      setHostLocationOID("0")
    }
  }
  const addUser = async (host_location_oid, name, phone_num, note) => {
    //const password_e = encryptAes(password)
    const url = `${config.api}/webservices/GeneralService.asmx`
    const bodyJson = {
      request: {
        host_location_oid: host_location_oid,
        name: name,
        phone_num: phone_num,
        note: note,
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      SessionIDEncN: store.getState().session,
      AdminOid: utill.base64Decode(sessionStorage.getItem("x-a-d-a") ?? ""),
      InputJSON: JSON.stringify(bodyJson),
      Mode: "UPDATE_HOST_USER_FACIAL",
    }
    const headers = {
      "Content-Type": "text/xml;charset=UTF-8",
      soapAction: "http://tempuri.org/UpdateAdminDataJSON",
    }
    const requestBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <UpdateAdminDataJSON xmlns="http://tempuri.org/">
            <AuthKeyEncD>${body.AuthKeyEncD}</AuthKeyEncD>
            <SessionIDEncN>${body.SessionIDEncN}</SessionIDEncN>
            <AdminOid>${body.AdminOid}</AdminOid>
            <InputJSON>${body.InputJSON}</InputJSON>
            <Mode>${body.Mode}</Mode>
          </UpdateAdminDataJSON>
        </soap:Body>
      </soap:Envelope>`

    try {
      const response = await axios.post(url, requestBody, {
        headers,
      })
      console.log("🚀 ~ file: index.jsx:187 ~ addAdmin ~ response:", response)

      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, "text/xml")

      const resultNode = xmlDoc.getElementsByTagName("Result")[0]
      const resultText = resultNode.textContent
      const resultObject = JSON.parse(resultText)

      if (resultObject.Result != null) {
        const result = resultObject.Result
        const resultCode = resultObject.ResultCode

        if (result === "+OK") {
          if (resultCode === "-INVALID_USER") {
            alert("존재하지 않는 유저 입니다.")
          } else if (resultCode === "-INVALID_HOST") {
            alert("잘못된 접근 입니다.")
          } else if (resultCode === "-EXIST_USER") {
            alert("이미 등록된 유저 입니다.")
          } else {
            alert("등록 되었습니다.")
          }
        } else {
          console.log("에러1")
        }
      } else {
        console.log("에러1")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = () => {
    // 데이터를 서버로 보내거나 저장하는 로직 추가
    addUser(hostLocationOID, formData.name, formData.phone_num, formData.note)
  }

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="유저 등록" subtitle="유저 등록 페이지" />
      <Box mt="30px">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              name="phone_num"
              label="핸드폰번호"
              fullWidth
              value={formData.phone_num}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="location_name"
              label="키오스크"
              fullWidth
              value={formData.location_name}
              onChange={handleLocationChange}
              select // select 필드를 사용하기 위해 추가
            >
              {locationOptions.map((option) => (
                <MenuItem
                  key={option.host_location_oid}
                  value={option.location_name}
                >
                  {option.location_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="name"
              label="이름"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="note"
              label="비고"
              fullWidth
              value={formData.note}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              저장
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default UpdateUserFacial
