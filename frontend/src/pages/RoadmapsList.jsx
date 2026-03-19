import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'
import { Map, Loader2, ArrowRight, Clock } from 'lucide-react'
import api from '../api'
import '../styles/Roadmap.css'

const RoadmapsList = () => {
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await api.get("/roadmap")
        setRoadmaps(res.data)
      } catch (err) {
        console.error("Failed to load roadmaps", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoadmaps()
  }, [])

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <header className="roadmap-page-header">
          <div className="roadmap-header-top">
            <Map size={26} className="icon-primary" />
            <h1 className="roadmap-page-title">My Roadmaps</h1>
          </div>
          <p className="roadmap-page-subtitle">
            Access your generated learning paths and track your growth.
          </p>
        </header>

        {loading ? (
          <div className="roadmap-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="roadmap-loading-spinner"
            >
              <Loader2 size={48} />
            </motion.div>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="roadmap-empty">
            <div className="roadmap-empty-icon">
              <Map size={30} />
            </div>
            <h3>No Roadmaps plotted yet</h3>
            <p>Go to your My History to generate a roadmap from a past analysis.</p>
            <Link to="/dashboard/history" className="btn btn-primary">
              Go to My History
            </Link>
          </div>
        ) : (
          <div className="roadmaps-grid">
            {roadmaps.map((rm, idx) => (
              <motion.div
                key={rm._id}
                className="roadmap-list-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
              >
                <div className="roadmap-list-info">
                  <h3>{rm.role}</h3>
                  <p>
                    <span className="roadmap-list-badge">{rm.estimatedWeeks} weeks</span>
                    Generated {new Date(rm.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
                <Link to={`/dashboard/roadmap/${rm._id}?mode=view`} className="roadmap-list-btn">
                  View Roadmap <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>
    </DashboardLayout>
  )
}

export default RoadmapsList