import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, Loader2, FileText, TrendingUp, Rocket } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import api from '../api'
import '../styles/History.css'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/career/history")
        setHistory(res.data)
      } catch (err) {
        setError("Failed to load history.")
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Compute stats
  const stats = useMemo(() => {
    if (!history.length) return null
    const scores = history.map(h => h.fitScore)
    const best = Math.max(...scores)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return { total: history.length, best, avg }
  }, [history])

  const getChartColor = (score) => {
    if (score >= 80) return "#10b981"
    if (score >= 50) return "#f59e0b"
    return "#ef4444"
  }

  const data = [...history].reverse().map((item, i) => ({
    name: i + 1,
    score: item.fitScore,
    role: item.targetRole,
    fill: getChartColor(item.fitScore)
  }))

  const getScoreTier = (s) => {
    if (s >= 80) return 'score-high'
    if (s >= 50) return 'score-mid'
    return 'score-low'
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <header className="history-header">
          <div className="history-header-top">
            <Clock size={26} className="icon-primary" />
            <h1 className="history-title">My History</h1>
          </div>
          <p className="history-subtitle">
            Track your progress across all past resume analyses.
          </p>
        </header>

        {loading ? (
          <div className="history-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="history-loading-spinner"
            >
              <Loader2 size={48} />
            </motion.div>
          </div>
        ) : error ? (
          <div className="history-error">{error}</div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">
              <FileText size={28} />
            </div>
            <h3>No missions logged yet</h3>
            <p>Upload your first resume to get an ATS fit score.</p>
            <Link to="/dashboard/analyze" className="btn btn-primary">
              <Rocket size={16} /> Start New Analysis
            </Link>
          </div>
        ) : (
          <>
            {/* Score trend visualization */}
            <div className="history-trend-card">
              <div className="history-trend-header">
                <div className="history-trend-title">
                  <TrendingUp size={16} className="icon-primary" />
                  <span>Score Progression</span>
                </div>
                <span className="history-trend-count">{history.length} analyses</span>
              </div>

              <div className="history-chart-container">
                <ResponsiveContainer>
                  <BarChart
                    data={data}
                    barCategoryGap="10%"
                  >
                  <XAxis hide />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const d = payload[0].payload
                        return (
                          <div className="history-tooltip">
                            <div>{d.role}</div>
                            <strong>{d.score}/100</strong>
                          </div>
                        )
                      }
                      return null
                    }}
                  />

                  <Bar
                    dataKey="score"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    activeBar={{ fillOpacity: 0.9 }}
                  />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats summary */}
            {stats && (
              <div className="history-stats">
                <div className="history-stat">
                  <div className="history-stat-label">Total Analyses</div>
                  <div className="history-stat-value">{stats.total}</div>
                </div>
                <div className="history-stat">
                  <div className="history-stat-label">Best Score</div>
                  <div className="history-stat-value stat-primary">{stats.best}</div>
                </div>
                <div className="history-stat">
                  <div className="history-stat-label">Average Score</div>
                  <div className="history-stat-value">{stats.avg}</div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Target Role</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                    >
                      <td className="history-date">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="history-role">{item.targetRole}</td>
                      <td>
                        <span className={`score-badge ${getScoreTier(item.fitScore)}`}>
                          {item.fitScore}
                        </span>
                      </td>
                      <td>
                        <div className="history-actions">
                          <Link to={`/dashboard/analysis/${item._id}`} className="history-btn">
                            View
                          </Link>
                          {item.roadmapId ? (
                            <Link to={`/dashboard/roadmap/${item.roadmapId}?mode=view`} className="history-btn history-btn-primary">
                              Roadmap <ArrowRight size={12} />
                            </Link>
                          ) : (
                            <Link to={`/dashboard/roadmap/${item._id}?mode=generate`} className="history-btn">
                              Generate Roadmap
                            </Link>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </motion.div>
    </DashboardLayout>
  )
}

export default History