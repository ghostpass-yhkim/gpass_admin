import React, { useEffect, useState } from "react"
import utill from "lib/utill"
import { useLocation, useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import Header from "components/Header"

const Dashboard = () => {
  const navigate = useNavigate()

  const [adminoid, setAdminOid] = useState("")
  const [id, setId] = useState("")
  const [adminlevel, setAdminLevel] = useState("")

  useEffect(() => {
    const iadminoid = utill.base64Decode(
      sessionStorage.getItem("x-a-d-a") ?? ""
    )
    const iid = utill.base64Decode(sessionStorage.getItem("x-a-d-i") ?? "")
    const ilevel = utill.base64Decode(sessionStorage.getItem("x-a-d-l") ?? "")
    setAdminOid(iadminoid)
    setId(iid)
    setAdminLevel(ilevel)
    if (iadminoid === "" || iid === "") {
      navigate("/login")
    }
  }, [adminoid, id])

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="대시보드" />
    </Box>
  )
}

export default Dashboard
