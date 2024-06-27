import { CssBaseline, ThemeProvider } from "@mui/material"
import { createTheme } from "@mui/material/styles"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { themeSettings } from "./theme"
import Layout from "scenes/layout"
import Dashboard from "scenes/dashboard"
import Login from "scenes/login"
import NewPassword from "scenes/newPassword"
import Users from "scenes/users"
import Admins from "scenes/admin"
import Hosts from "scenes/host"
import Kiosks from "scenes/kiosk"
import Facials from "scenes/facials"
import Transactions from "scenes/transactions"
import HostKiosks from "scenes/kiosk/hostkiosks"
import HostFacials from "scenes/facials/hostfacials"
import HostTransactions from "scenes/transactions/hosttarnsactions"
import UpdateUserFacial from "scenes/facials/updatefacial"

function App() {
  const mode = useSelector((state) => state.global.mode)
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/facials" element={<Facials />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/hosts" element={<Hosts />} />
              <Route path="/kiosks" element={<Kiosks />} />
              <Route path="/admins" element={<Admins />} />
              <Route path="/hostkiosks" element={<HostKiosks />} />
              <Route path="/hostfacials" element={<HostFacials />} />
              <Route path="/updatefacial" element={<UpdateUserFacial />} />
              <Route path="/hosttransactions" element={<HostTransactions />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/newpassword" element={<NewPassword />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
