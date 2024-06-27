import * as React from "react"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useTheme } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import Collapse from "@mui/material/Collapse"
import Alert from "@mui/material/Alert"
import DialogTitle from "@mui/material/DialogTitle"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import encrypt from "lib/encryption"
import { Autorenew } from "@mui/icons-material"
import utill from "lib/utill"
import { encryptAes } from "lib/aes"
import { config } from "config"

const NewPassword = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  const [openDialog, setOpenDialog] = React.useState(false)
  const [errorAlert, setErrorAlert] = React.useState(false)
  const [password, setPassword] = React.useState("")

  const handleClickOpen = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const newPassword = data.get("password")
    if (newPassword != null && newPassword.length > 3) {
      setOpenDialog(true)
      setPassword(newPassword)
    } else {
      setErrorAlert(true)
    }
  }

  const handleClose = () => {
    setOpenDialog(false)
  }

  const handleSubmit = () => {
    setOpenDialog(false)
    RePassword()
  }

  const authKeyEncD = encrypt(
    process.env.REACT_APP_AUTH_KEY,
    process.env.REACT_APP_PUBLIC_KEY
  )

  const RePassword = async () => {
    //const password_e = encryptAes(password)

    const url = `${config.api}/webservices/GeneralService.asmx`
    const bodyJson = {
      request: {
        admin_id: utill.base64Decode(sessionStorage.getItem("x-a-d-i") ?? ""),
        password_enc: encrypt(password, process.env.REACT_APP_PUBLIC_KEY),
        admin_oid: utill.base64Decode(sessionStorage.getItem("x-a-d-a") ?? ""),
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      InputJSON: JSON.stringify(bodyJson),
      Mode: "RE_PASSWORD",
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
            resultCode === "-INVALID_ID"
          ) {
            console.log("에러1")
          } else {
            // 정상 로그인
            navigate("/login")
          }
        } else {
          console.log("에러2")
        }
      } else {
        console.log("에러3")
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
            <Autorenew />
          </Avatar>
          <Typography component="h1" variant="h5">
            최초 로그인 비밀번호 재설정
          </Typography>
          <Box
            component="form"
            onSubmit={handleClickOpen}
            noValidate
            sx={{ mt: 1 }}
          >
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
                비밀번호는 4자 이상입니다.
              </Alert>
            </Collapse>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              변경
            </Button>
          </Box>
        </Box>
      </Container>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"비밀번호를 변경 하시겠습니까?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSubmit} autoFocus>
            변경
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default NewPassword
