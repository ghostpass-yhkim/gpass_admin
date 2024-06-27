import React, { useEffect, useState } from "react"
import { Box, Button, TextField, Typography, useTheme } from "@mui/material"
import Header from "components/Header"
import { DataGrid } from "@mui/x-data-grid"
import store from "state/store"
import encrypt from "lib/encryption"
import axios from "axios"
import utill from "lib/utill"
import { config } from "config"

const Transactions = () => {
  const theme = useTheme()
  const [name, setName] = React.useState("")
  const [location_name, setLocationName] = React.useState("")

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
      field: "transaction_oid",
      headerName: "인증 번호",
      flex: 0.5,
    },
    {
      field: "user_oid",
      headerName: "유저 번호",
      flex: 0.5,
    },
    {
      field: "host_location_oid",
      headerName: "키오스크 번호",
      flex: 0.5,
    },
    {
      field: "user_name",
      headerName: "이름",
      flex: 0.5,
    },
    {
      field: "location_name",
      headerName: "키오스크 이름",
      flex: 0.5,
    },
    {
      field: "note",
      headerName: "비고",
      flex: 0.5,
    },
    {
      field: "date_created",
      headerName: "가입날짜",
      flex: 0.5,
    },
    {
      field: "status",
      headerName: "상태",
      flex: 0.5,
      renderCell: (params) => {
        if (params.value === "A") {
          return "성공"
        } else {
          return "실패"
        }
      },
    },
  ]

  const authKeyEncD = encrypt(
    process.env.REACT_APP_AUTH_KEY,
    process.env.REACT_APP_PUBLIC_KEY
  )

  useEffect(() => {
    getTransactionList()
  }, [paginationModel])

  const getTransactionList = async () => {
    const url = `${config.api}/webservices/GeneralService.asmx`
    const bodyJson = {
      request: {
        page_no: paginationModel.page + 1,
        name: name,
        location_name: location_name,
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      SessionIDEncN: store.getState().session,
      AdminOid: utill.base64Decode(sessionStorage.getItem("x-a-d-a") ?? ""),
      InputJSON: JSON.stringify(bodyJson),
      Mode: "GET_TRANSACTION_LIST",
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

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleLocationNameChange = (event) => {
    setLocationName(event.target.value)
  }

  const handleButtonClick = (params) => {
    getTransactionList()
  }

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="인증 내역" subtitle="인증 내역 리스트" />
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="1rem"
        >
          <Box>
            <Typography
              component="p"
              variant="body1"
              sx={{ paddingRight: "1rem" }}
            ></Typography>
          </Box>
          <Box display="flex" alignItems="center" gap="1rem">
            <TextField
              label="이름으로 검색"
              value={name}
              onChange={handleNameChange}
              sx={{ width: "200px" }}
            />
            <TextField
              label="키오스크 이름으로 검색"
              value={location_name}
              onChange={handleLocationNameChange}
              sx={{ width: "200px" }}
            />
            <Button variant="contained" onClick={handleButtonClick}>
              검색
            </Button>
          </Box>
        </Box>
        <DataGrid
          getRowId={(row) => row.transaction_oid}
          rows={rows || []}
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

export default Transactions
