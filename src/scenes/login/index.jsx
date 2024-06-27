import React, { useEffect, useState } from "react"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import TextField from "@mui/material/TextField"
import Alert from "@mui/material/Alert"
import Collapse from "@mui/material/Collapse"
import Box from "@mui/material/Box"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useTheme } from "@mui/material"
import encrypt from "lib/encryption"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import store from "state/store"
import sessionSlice, { setSession } from "state/session"
import utill from "lib/utill"
import { decryptAes, encryptAes } from "lib/aes"
import { config } from "config"
import { setPublicKey } from "state/publickey"

const Login = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  const [errorAlert, setErrorAlert] = React.useState(false)
  const [ip, setIp] = React.useState()

  const handleSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    signIn(data.get("id"), data.get("password"))
  }

  const authKeyEncD = encrypt(
    process.env.REACT_APP_AUTH_KEY,
    process.env.REACT_APP_PUBLIC_KEY
  )

  useEffect(() => {
    axios.get("https://geolocation-db.com/json/").then((res) => {
      setIp(res.data.IPv4)
      console.log(res.data.IPv4)
    })
  }, [])

  const signIn = async (id, password) => {
    //const password_e = encryptAes(password)
    const url = `${config.api}/webservices/GeneralService.asmx`

    const bodyJson = {
      request: {
        admin_id: id,
        password_enc: encrypt(password, process.env.REACT_APP_PUBLIC_KEY),
        ip_address: ip,
        browser_type: getBrowserInfo().type,
        browser_ver: getBrowserInfo().version,
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      InputJSON: JSON.stringify(bodyJson),
      Mode: "SIGN_IN",
    }
    const headers = {
      "Content-Type": "text/xml;charset=UTF-8",
      soapAction: "http://tempuri.org/AdminSignIn",
    }
    const requestBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <AdminSignIn xmlns="http://tempuri.org/">
            <AuthKeyEncD>${body.AuthKeyEncD}</AuthKeyEncD>
            <InputJSon>${body.InputJSON}</InputJSon>
            <Mode>${body.Mode}</Mode>
          </AdminSignIn>
        </soap:Body>
      </soap:Envelope>`

    try {
      const response = await axios.post(url, requestBody, {
        headers,
      })
      console.log("🚀 ~ file: index.jsx:87 ~ signIn ~ response:", response)

      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, "text/xml")

      const resultNode = xmlDoc.getElementsByTagName("Result")[0]
      const resultText = resultNode.textContent
      const resultObject = JSON.parse(resultText)

      if (resultObject.Result != null) {
        const result = resultObject.Result
        const resultCode = resultObject.ResultCode

        if (result === "+OK") {
          if (
            // 로그인 오류
            resultCode === "-INVALID_ID" ||
            resultCode === "-INVALID_PASSWORD" ||
            resultCode === "-INVALID_ADMIN_STATUS"
          ) {
            setErrorAlert(true)
          } else if (resultCode === "-NEW_PASSWORD") {
            // 새로운 패스워드 적용
            const adminOid = resultObject.Admin_oid
            sessionStorage.clear()
            sessionStorage.setItem("x-a-d-i", utill.base64Encode(id))
            sessionStorage.setItem("x-a-d-a", utill.base64Encode(adminOid))

            navigate("/newpassword")
          } else {
            // 정상 로그인
            const adminOid = resultObject.Admin_oid
            const sessionID = resultObject.SessionID
            const dateValid = resultObject.DateValid
            const adminName = resultObject.AdminName
            const adminLevel = resultObject.AdminLevel
            const publicKey = resultObject.PublicKey

            const sessionEncN = encrypt(sessionID, publicKey)

            sessionStorage.clear()
            sessionStorage.setItem("x-a-d-i", utill.base64Encode(id))
            sessionStorage.setItem("x-a-d-l", utill.base64Encode(adminLevel))
            sessionStorage.setItem("x-a-d-a", utill.base64Encode(adminOid))
            sessionStorage.setItem("x-a-d-n", utill.base64Encode(adminName))

            //session 저장
            store.dispatch(setSession(sessionEncN))
            store.dispatch(setPublicKey(publicKey))
            //store.dispatch(clearSession())

            if (adminLevel == 5 || adminLevel == 9) {
              navigate("/dashboard")
            } else {
              navigate("/hostkiosks")
            }
          }
        } else {
          setErrorAlert(true)
        }
      } else {
        setErrorAlert(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            어드민 로그인
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="id"
              label="id"
              name="id"
              autoComplete="id"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Collapse in={errorAlert}>
              <Alert
                severity="error"
                onClose={() => {
                  setErrorAlert(false)
                }}
              >
                아이디 또는 비밀번호를 확인해주세요.
              </Alert>
            </Collapse>
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              로그인
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )

  function getBrowserInfo() {
    const userAgent = navigator.userAgent
    const browser = {}

    // 브라우저 유형 확인
    if (userAgent.indexOf("Firefox") > -1) {
      browser.type = "Firefox"
    } else if (userAgent.indexOf("Chrome") > -1) {
      browser.type = "Chrome"
    } else if (userAgent.indexOf("Safari") > -1) {
      browser.type = "Safari"
    } else if (
      userAgent.indexOf("MSIE") > -1 ||
      userAgent.indexOf("Trident/") > -1
    ) {
      browser.type = "Internet Explorer"
    } else {
      browser.type = "Unknown"
    }

    // 브라우저 버전 확인
    if (/MSIE|Trident/.test(userAgent)) {
      // Internet Explorer
      const matchIE = userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/)
      if (matchIE) {
        browser.version = parseInt(matchIE[1])
      }
    } else {
      // 다른 브라우저
      const matchVersion = userAgent.match(/(?:Chrome|Firefox|Safari)\/(\d+)/)
      if (matchVersion) {
        browser.version = parseInt(matchVersion[1])
      }
    }

    return browser
  }
}

export default Login
