import axios from "axios"

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
})

// instance.interceptors.response.use(
//   (res) => {
//     return res
//   },
//   (err) => {
//     console.log(err.response.status)
//     if (Number(err.response.status) === 400) {
//       const navigate = useNavigate()
//       navigate('/login')
//     } else {
//       alert('Network Error')
//     }
//   },
// )

export default instance
