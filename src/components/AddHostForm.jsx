import React, { useState } from "react"
import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material"

const AddHostForm = ({ onAddRow }) => {
  const theme = useTheme()

  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const newRow = { name, id, password }
    onAddRow(newRow)
    setName("")
    setId("")
    setPassword("")
  }

  return (
    <Box
      sx={{ display: "flex" }}
      component="form"
      onSubmit={handleSubmit}
      noValidate
    >
      <TextField
        sx={{ mt: 3, mr: 1 }}
        fullWidth
        margin="normal"
        required
        id="id"
        label="아이디"
        name="id"
        autoComplete="id"
        value={id}
        onChange={(e) => setId(e.target.value)}
        autoFocus
      />
      <TextField
        sx={{ mt: 3, mr: 1 }}
        fullWidth
        margin="normal"
        required
        name="password"
        label="임시 비밀번호"
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <TextField
        sx={{ mt: 3, mr: 1 }}
        fullWidth
        margin="normal"
        required
        name="name"
        label="호스트 이름"
        type="name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 1 }}>
        추가
      </Button>
    </Box>
  )
}

export default AddHostForm
