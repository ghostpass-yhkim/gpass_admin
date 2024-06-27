import React, { useEffect, useState } from "react"
import { Box, Button, Checkbox, Typography, useTheme } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import store from "state/store"
import encrypt from "lib/encryption"
import axios from "axios"
import utill from "lib/utill"
import Header from "./Header"
import { config } from "config"

const AdminList = ({ selectedItem, onClose }) => {
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
  const [selectedRows, setSelectedRows] = React.useState([])

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
          return "주차장 관리자 계정"
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

  const updateAdminLocation = async () => {
    const url = `${config.api}/webservices/GeneralService.asmx`

    const list = []
    for (let i of selectedRows) {
      const object = {
        admin_oid: i,
        parking_location_oid: selectedItem.parking_location_oid,
      }
      list.push(object)
    }

    const bodyJson = {
      request: {
        list: list,
      },
    }
    const body = {
      AuthKeyEncD: authKeyEncD,
      SessionIDEncN: store.getState().session,
      AdminOid: utill.base64Decode(sessionStorage.getItem("x-a-d-a") ?? ""),
      InputJSON: JSON.stringify(bodyJson),
      Mode: "UPDATE_ADMIN_LOCATION",
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

      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, "text/xml")

      const resultNode = xmlDoc.getElementsByTagName("Result")[0]
      const resultText = resultNode.textContent
      const resultObject = JSON.parse(resultText)

      if (resultObject.Result != null) {
        const result = resultObject.Result
        onClose()
      } else {
        onClose()
        alert("어드민 추가를 실패했습니다.")
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

  const handleRowSelection = (params) => {
    setSelectedRows(params)
  }

  const handleSubmit = () => {
    updateAdminLocation()
  }
  const handleClose = (e) => {
    onClose()
  }

  return (
    <Box m="1.5rem 2.5rem" bgcolor="#292929">
      <Box
        mt="50px"
        height="75vh"
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
          type="submit"
          variant="contained"
          sx={{ mt: 3, mb: 1, ml: 1 }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="10px"
        >
          <Header subtitle="어드민 추가하기" />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ mr: 1, mt: 1 }}
            onClick={handleSubmit}
          >
            추가하기
          </Button>
        </Box>
        <DataGrid
          checkboxSelection
          getRowId={(row) => row.admin_oid}
          rows={rows || []}
          columns={columns}
          pageSizeOptions={[pageSize]}
          hideFooterSelectedRowCount={true}
          rowCount={rowCount}
          paginationMode="server"
          onPaginationModelChange={handlePaginationModelChange}
          onRowSelectionModelChange={handleRowSelection}
          paginationModel={paginationModel}
          loading={isLoading}
        />
      </Box>
      <Button
        variant="contained"
        color="error"
        onClick={handleClose}
        sx={{ ml: 1, mt: 1 }}
      >
        닫기
      </Button>
    </Box>
  )
}

export default AdminList
