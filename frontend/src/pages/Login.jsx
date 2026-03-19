import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { ClipLoader } from "react-spinners"
import api from "../api"
import '../styles/Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard")
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await api.post("/auth/login", { email, password })

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/dashboard")
    }
    catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again."
      setError(msg)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-glow"></div>

      <nav className="auth-nav">
        <Link to="/" className="brand-logo">
          Career<span className="brand-accent">OS</span>
        </Link>
      </nav>

      <div className={`auth-card ${loading ? 'loading' : ''}`}>
        <div className="auth-progress-bar"></div>

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue your career growth.</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <Mail size={18} className="form-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <Lock size={18} className="form-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <ClipLoader size={18} color="#fff" />
                <span style={{ marginLeft: '8px' }}>Initiating...</span>
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/signup" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  )
}

export default Login