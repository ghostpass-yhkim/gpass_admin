import React, { useEffect, useState } from "react"
import { Box, useTheme } from "@mui/material"
import Header from "components/Header"
import { DataGrid } from "@mui/x-data-grid"
import store from "state/store"
import encrypt from "lib/encryption"
import axios from "axios"
import utill from "lib/utill"
import AddAdminForm from "components/AddAdminForm"
import { encryptAes } from "lib/aes"
import { config } from "config"

const Admins = () => {
  const theme = useTheme()
  const [name, setName] = React.useState("")

  const [rows, setRows] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [isLoading, setIsLoading] = useState(false)
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 20,
  })

  const columns = [
    {
      field: "admin_oid",
      headerName: "어드민번호",
      flex: 0.5,
    },
    {
      field: "admin_id",
      headerName: "어드민 ID",
      flex: 0.5,
    },
    {
      field: "admin_name",
      headerName: "어드민 이름",
      flex: 0.5,
    },
    {
      field: "admin_level",
      headerName: "어드민 권한",
      flex: 0.5,
      renderCell: (params) => {
        if (params.value === 9) {
          return "슈퍼 계정"
        } else if (params.value === 5) {
          return "일반 계정"
        } else {
          return "호스트 계정"
        }
      },
    },
    {
      field: "host_oid",
      headerName: "호스트 번호(호스트계정)",
      flex: 0.5,
      renderCell: (params) => {
        if (params.value === null) {
          return "슈퍼 계정"
        }
      },
    },
    {
      field: "date_created",
      headerName: "등록날짜",
      flex: 0.5,
    },
    {
      field: "status",
      headerName: "상태",
      flex: 0.5,
      renderCell: (params) => {
        if (params.value === "A") {
          return "정상"
        } else {
          return "탈퇴"
        }
      },
    },
  ]

  const authKeyEncD = encrypt(
    process.env.REACT_APP_AUTH_KEY,
    process.env.REACT_APP_PUBLIC_KEY
  )

  useEffect(() => {
    getUserList()
  }, [paginationModel])

  const getUserList = async () => {
    const url = `${config.api}/webservices/GeneralService.asmx`
    const bodyJson = {
      request: {
        page_no: paginationModel.page + 1,
        name: name,
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      SessionIDEncN: store.getState().session,
      AdminOid: utill.base64Decode(sessionStorage.getItem("x-a-d-a") ?? ""),
      InputJSON: JSON.stringify(bodyJson),
      Mode: "GET_ADMIN_LIST",
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
      console.log(
        "🚀 ~ file: index.jsx:121 ~ getUserList ~ response:",
        response
      )

      setIsLoading(false)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, "text/xml")

      const resultNode = xmlDoc.getElementsByTagName("Result")[0]
      const resultText = resultNode.textContent
      const resultObject = JSON.parse(resultText)
      console.log(
        "🚀 ~ file: index.jsx:129 ~ getUserList ~ resultObject:",
        resultObject
      )

      if (resultObject.Result != null) {
        const result = resultObject.Result
        const resultCode = resultObject.ResultCode

        if (result === "+OK") {
          setRowCount(resultObject.Total)
          setRows(resultObject.Item)
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

  const addAdmin = async (id, password, name, level) => {
    //const password_e = encryptAes(password)
    const url = `${config.api}/webservices/GeneralService.asmx`
    const bodyJson = {
      request: {
        admin_id: id,
        password_enc: encrypt(password, process.env.REACT_APP_PUBLIC_KEY),
        admin_name: name,
        admin_level: level,
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      InputJSON: JSON.stringify(bodyJson),
      Mode: "SIGN_UP",
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
          if (resultCode === "-EXIST_ID") {
            alert("이미 존재하는 아이디 입니다.")
          } else {
            // 정상
            const newPaginationModel = {
              page: 0,
              pageSize: 20,
            }
            setPaginationModel(newPaginationModel)
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

  const handlePaginationModelChange = (newPaginationModel) => {
    console.log(newPaginationModel)
    setPaginationModel(newPaginationModel)
  }

  const handleAddRow = (newRow) => {
    console.log(newRow)
    addAdmin(newRow.id, newRow.password, newRow.name, newRow.level)
  }

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="어드민" subtitle="어드민 리스트" />
      <AddAdminForm onAddRow={handleAddRow} />
      <Box
        height="75vh"
        width="99%"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        <DataGrid
          getRowId={(row) => row.admin_oid}
          rows={rows}
          columns={columns}
          pageSizeOptions={[pageSize]}
          rowCount={rowCount}
          paginationMode="server"
          onPaginationModelChange={handlePaginationModelChange}
          paginationModel={paginationModel}
          loading={isLoading}
        />
      </Box>
    </Box>
  )
}

export default Admins
