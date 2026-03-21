import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Map, Zap, LogOut, User, Clock } from 'lucide-react'
import '../styles/Dashboard.css'

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <FileText size={20} />, label: "New Analysis", path: "/dashboard/analyze" },
    { icon: <Clock size={20} />, label: "My History", path: "/dashboard/history" },
    { icon: <Map size={20} />, label: "Roadmaps", path: "/dashboard/roadmaps" },
    { icon: <Zap size={20} />, label: "Optimizer", path: "/dashboard/optimizer" }
  ]

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <Link to="/dashboard" className="sidebar-brand">
          Career<span className="brand-accent">OS</span>
        </Link>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-info">
              <div className="user-name">{user.name || "User"}</div>
              <div className="user-plan">Free Plan</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout