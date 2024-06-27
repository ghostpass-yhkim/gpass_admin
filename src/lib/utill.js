import { Buffer } from "buffer"
const utill = {
  base64Encode: (text) => {
    return Buffer.from(`a890-345m,nbvj8${text}`, "utf8").toString("base64")
  },
  base64Decode: (text) => {
    return Buffer.from(text, "base64")
      .toString("utf8")
      .replace("a890-345m,nbvj8", "")
  },
  isLogin: () => {
    const adminoid = sessionStorage.getItem("x-a-d-a")
    const id = sessionStorage.getItem("x-a-d-i")
    const adminlevel = sessionStorage.getItem("x-a-d-l")
    if (adminoid !== null && id !== null) {
      return true
    } else {
      return false
    }
  },
}

export default utill
