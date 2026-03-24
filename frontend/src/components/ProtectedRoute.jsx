import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    const isExpired = payload.exp * 1000 < Date.now()

    if (isExpired) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      return <Navigate to="/login" replace />
    }
  } catch (error) {
    console.error("Invalid token format")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return <Navigate to="/login" replace />
  }
  return children
}