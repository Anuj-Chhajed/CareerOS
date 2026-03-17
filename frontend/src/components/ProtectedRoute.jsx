import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { PulseLoader } from 'react-spinners'
import api from "../api"

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsAuth(false)
        return
      }
      try {
        await api.get("/auth/profile")
        setIsAuth(true)
      } catch {
        localStorage.removeItem("token")
        setIsAuth(false)
      }
    }
    checkAuth()
  }, [])

  if (isAuth === null) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '1.5rem',
        background: 'transparent'
      }}>
        <PulseLoader color="var(--primary)" size={15} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Authenticating
          </p>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Securing your session...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return children
}