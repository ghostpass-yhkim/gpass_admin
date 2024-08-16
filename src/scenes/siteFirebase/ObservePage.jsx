import React, { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { database } from "firebaseConfig"
import { ref, onValue } from "firebase/database"
import "./style.css" // 스타일링을 위한 CSS 파일 추가

const ObservePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { key } = useParams()
  const [data, setData] = useState([])
  const { title } = location.state || {} // 전달된 title을 가져옴

  useEffect(() => {
    const dbRef = ref(database, `/gpass2/kiosk/users/${key}`)

    // Firebase Realtime Database에서 데이터를 실시간으로 구독
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const formattedData = Object.values(data).map((item) => {
          const { Name, PhoneNo } = item
          const phoneLastFour = PhoneNo.slice(-4)
          return `${Name} + ${phoneLastFour}`
        })
        setData(formattedData)
      } else {
        // 데이터가 존재하지 않으면 빈 배열로 설정하여 리스트를 지움
        setData([])
      }
    })

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      unsubscribe()
    }
  }, [key])

  return (
    <div className="observe-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
      <h2 className="title">{title} 대기명단</h2>
      <div className="data-container">
        <ul className="data-list">
          {data.map((item, index) => (
            <li key={index} className="data-item">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ObservePage
