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
import AddHostForm from "components/AddHostForm"
import { setSession } from "state/session"

const Hosts = () => {
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
      field: "host_oid",
      headerName: "호스트번호",
      flex: 0.5,
    },
    {
      field: "host_id",
      headerName: "호스트 ID",
      flex: 0.5,
    },
    {
      field: "host_title",
      headerName: "호스트 이름",
      flex: 0.5,
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
        } else if (params.value === "P") {
          return "대기"
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
    getHostList()
  }, [paginationModel])

  const getHostList = async () => {
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
      Mode: "GET_HOST_LIST",
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

  const addHost = async (id, password, title) => {
    //const password_e = encryptAes(password)
    const url = `${config.api}/webservices/GeneralService.asmx`
    const bodyJson = {
      request: {
        host_id: id,
        password_enc: encrypt(password, store.getState().publicKey),
        host_title: title,
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      SessionIDEncN: store.getState().session,
      AdminOid: utill.base64Decode(sessionStorage.getItem("x-a-d-a") ?? ""),
      InputJSON: JSON.stringify(bodyJson),
      Mode: "UPDATE_HOST",
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
    addHost(newRow.id, newRow.password, newRow.name)
  }

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="호스트" subtitle="호스트 리스트" />
      <AddHostForm onAddRow={handleAddRow} />
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
          getRowId={(row) => row.host_oid}
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

export default Hosts
