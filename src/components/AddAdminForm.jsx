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

const AddAdminForm = ({ onAddRow }) => {
  const theme = useTheme()

  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [level, setLevel] = useState("")
  const [password, setPassword] = useState("")
  const [selectedOption, setSelectedOption] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const newRow = { name, id, level, password }
    onAddRow(newRow)
    setName("")
    setId("")
    setPassword("")
    setLevel("")
    setSelectedOption("")
  }

  const handleChange = (event) => {
    setSelectedOption(event.target.value)
    setLevel(event.target.value)
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
        label="어드민 이름"
        type="name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FormControl fullWidth>
        <InputLabel sx={{ mt: 3, mr: 1, mb: 1 }} id="demo-simple-select-label">
          어드민 권한
        </InputLabel>
        <Select
          sx={{ mt: 3, mr: 1, mb: 1 }}
          labelId="demo-simple-select-label"
          label="어드민 권한"
          id="select"
          value={selectedOption}
          onChange={handleChange}
        >
          <MenuItem value="9">슈퍼 계정</MenuItem>
          <MenuItem value="5">일반 계정</MenuItem>
          <MenuItem value="0">주차장 관리자 계정</MenuItem>
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 1 }}>
        추가
      </Button>
    </Box>
  )
}

export default AddAdminForm
