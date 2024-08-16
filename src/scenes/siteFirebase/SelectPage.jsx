import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // useNavigate로 변경
import { auth } from "firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import "./style.css"

const SelectPage = () => {
  const navigate = useNavigate() // useHistory 대신 useNavigate 사용
  const [user, setUser] = useState(null)

  useEffect(() => {
    login() // 로그인 함수 호출
  }, [])

  const handleSelect = (key, title) => {
    navigate(`/sitefirebase/observe/${key}`, {
      state: { title }, // title을 함께 전달
    })
  }

  const login = async () => {
    try {
      const email = process.env.REACT_APP_FIREBASE_EMAIL
      const password = process.env.REACT_APP_FIREBASE_PASSWORD

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      setUser(userCredential.user)
    } catch (error) {
      console.error("Error signing in", error)
    }
  }

  if (!user) {
    return <div>Loading...</div> // 로그인 전에는 로딩 상태 표시
  }

  return (
    <div className="select-page">
      <h2 className="title">위치선택</h2>
      <ul className="option-list">
        <li
          className="option-item"
          onClick={() => handleSelect("h1000000022", "사무실")}
        >
          사무실
        </li>
        <li
          className="option-item"
          onClick={() => handleSelect("h1000000017", "상무초밥")}
        >
          상무초밥
        </li>
        <li
          className="option-item"
          onClick={() => handleSelect("h1000000030", "창경")}
        >
          창경
        </li>
        <li
          className="option-item"
          onClick={() => handleSelect("h1000000033", "복지관")}
        >
          복지관
        </li>
      </ul>
    </div>
  )
}

export default SelectPage
