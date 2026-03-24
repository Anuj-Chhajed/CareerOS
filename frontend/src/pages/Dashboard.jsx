import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'
import { Rocket, Map, Zap, ArrowRight, Activity, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import Chart from 'react-apexcharts'
import { ClipLoader } from 'react-spinners'
import api from '../api'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const [stats, setStats] = useState({ total: 0, highestScore: 0 })
  const [recent, setRecent] = useState([])
  const [chartData, setChartData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/career/history")
        const historyData = res.data || []

        const highest = historyData.reduce((max, item) => item.fitScore > max ? item.fitScore : max, 0)

        setStats({ total: historyData.length, highestScore: highest })
        setRecent(historyData.slice(0, 3))

        const sparklineScores = [...historyData].reverse().slice(-15).map(item => item.fitScore)
        setTrendData(sparklineScores)

        const roleScores = {}
        historyData.forEach(item => {
          const role = item.targetRole
          // If we haven't seen this role, or if this score is higher than the saved one, update it
          if (!roleScores[role] || item.fitScore > roleScores[role]) {
            roleScores[role] = item.fitScore
          }
        })

        // Convert the object into an array, sort by highest score, and take the top 5
        const bestRoles = Object.entries(roleScores)
          .map(([role, score]) => ({
            role: role,
            score: score
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)

        setChartData(bestRoles)
      } catch (err) {
        console.error("Failed to load dashboard stats", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--primary)'
    if (s >= 50) return 'var(--accent)'
    return '#ef4444'
  }

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Strong Match'
    if (s >= 50) return 'Moderate Fit'
    return 'Needs Work'
  }

  const lastAnalysis = recent.length > 0 ? recent[0] : null

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-loading-full">
          <ClipLoader color="#06D6A0" size={80} />
          <p className="loading-text">Syncing data...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* ═══ Page Header ═══ */}
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">
              Welcome back, {user.name?.split(" ")[0] || "Commander"}
            </h1>
            <p className="dash-subtitle">Here's your career mission status.</p>
          </div>
        </div>

        {/* ═══ Section 1: Status Summary ("Your Orbit") ═══ */}
        <div className="orbit-card">
          {stats.total > 0 && lastAnalysis ? (
            <div className="orbit-content">
              {/* Score Ring */}
              <div className="orbit-score-area">
                <div className="orbit-ring-container">
                  <svg className="orbit-ring" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <motion.circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke={getScoreColor(stats.highestScore)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="326.73"
                      initial={{ strokeDashoffset: 326.73 }}
                      animate={{ strokeDashoffset: 326.73 - (326.73 * stats.highestScore) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="orbit-ring-value">
                    <span className="orbit-score-number">{stats.highestScore}</span>
                    <span className="orbit-score-sub">/ 100</span>
                  </div>
                </div>
                <span className="orbit-score-label" style={{ color: getScoreColor(stats.highestScore) }}>
                  {getScoreLabel(stats.highestScore)}
                </span>
              </div>

              {/* Stats Section */}
              <div className="orbit-stats">
                <div className="orbit-stat-row">
                  <div className="orbit-stat-icon"><Activity size={16} /></div>
                  <div>
                    <div className="orbit-stat-label">Total Analyses</div>
                    <div className="orbit-stat-value">{stats.total}</div>
                  </div>
                </div>
                <div className="orbit-stat-row">
                  <div className="orbit-stat-icon"><TrendingUp size={16} /></div>
                  <div>
                    <div className="orbit-stat-label">Best Score</div>
                    <div className="orbit-stat-value" style={{ color: getScoreColor(stats.highestScore) }}>{stats.highestScore}%</div>
                  </div>
                </div>
                <div className="orbit-stat-row">
                  <div className="orbit-stat-icon"><Clock size={16} /></div>
                  <div>
                    <div className="orbit-stat-label">Last Analysis</div>
                    <div className="orbit-stat-value">{lastAnalysis.targetRole}</div>
                    <div className="orbit-stat-date">{new Date(lastAnalysis.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              {/* 3. NEW: Mini Sparkline Chart */}
              <div className="sparkline-container">
                
                <div className="sparkline-header">
                  <h4 className="sparkline-title">Fit Score Trajectory</h4>
                  <p className="sparkline-subtitle">Trend of your last 15 missions</p>
                </div>
                
                <div className="sparkline-wrapper">
                  <Chart
                    type="area"
                    height={100}
                    series={[{ name: 'Score', data: trendData }]}
                    options={{
                      chart: {
                        sparkline: { enabled: true }, 
                        animations: { enabled: true, easing: 'easeinout', speed: 800 }
                      },
                      colors: ['#06D6A0'], 
                      stroke: { curve: 'smooth', width: 3 },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.5,
                          opacityTo: 0,
                          stops: [0, 100]
                        }
                      },
                      tooltip: {
                        theme: 'dark',
                        fixed: { enabled: false },
                        x: { show: false }, 
                        y: { formatter: (val) => val + "%" },
                        marker: { show: false }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="orbit-empty">
              <div className="orbit-empty-icon"><Rocket size={32} /></div>
              <h3 className="orbit-empty-title">Launch your first analysis</h3>
              <p className="orbit-empty-text">Upload your resume to discover your market fit score and skill gaps.</p>
              <Link to="/dashboard/analyze" className="btn btn-primary">
                Begin Your Mission
              </Link>
            </div>
          )}
        </div>

        {/* 4. NEW CHART CARD: Top Roles (Horizontal Bar) */}
          {chartData.length > 0 && (
            <div className="orbit-card chart-card">
              <h3 className="chart-card-title">
                Strongest Role Matches
              </h3>
              <p className="chart-card-subtitle">
                Your highest fit scores grouped by target position.
              </p>
              
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 0, right: 60, left: 0, bottom: 0 }} 
                  >
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                      </linearGradient>
                    </defs>

                    <XAxis type="number" hide domain={[0, 100]} />
                    
                    <YAxis
                      type="category"
                      dataKey="role"
                      width={220}
                      tickMargin={20}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 500 }}
                      tickFormatter={(value) => value.length > 22 ? value.substring(0, 22) + '...' : value}
                    />
                    
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155', 
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                      itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                      formatter={(value) => [`${value}%`, 'Fit Score']}
                    />
                    
                    <Bar 
                      dataKey="score" 
                      fill="url(#barGradient)" 
                      barSize={24}
                      radius={[6, 6, 6, 6]}
                    >
                      <LabelList
                        dataKey="score"
                        position="right"
                        offset={15}
                        formatter={(val) => `${val}%`}
                        fill="#f8fafc"
                        fontSize={13}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        {/* ═══ Section 2: Quick Actions ═══ */}
        <h3 className="dash-section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/dashboard/analyze" className="action-card action-primary">
            <div className="action-icon"><Rocket size={22} /></div>
            <div className="action-label">New Analysis</div>
            <div className="action-desc">Upload & score your resume</div>
          </Link>
          <Link to="/dashboard/optimizer" className="action-card">
            <div className="action-icon"><Zap size={22} /></div>
            <div className="action-label">Optimizer</div>
            <div className="action-desc">Rewrite weak bullet points</div>
          </Link>
          <Link to="/dashboard/roadmaps" className="action-card">
            <div className="action-icon"><Map size={22} /></div>
            <div className="action-label">Roadmap</div>
            <div className="action-desc">View your learning roadmaps</div>
          </Link>
        </div>

        {/* ═══ Section 3: Recent Activity ("Mission Log Preview") ═══ */}
        <div className="activity-header">
          <h3 className="dash-section-title">Recent History</h3>
          {recent.length > 0 && (
            <Link to="/dashboard/history" className="activity-view-all">
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {recent.length > 0 ? (
          <div className="activity-list">
            {recent.map((item, idx) => (
              <Link
                to={`/dashboard/analysis/${item._id}`}
                key={item._id}
                className="activity-row"
              >
                <div className="activity-role">{item.targetRole}</div>
                <div className="activity-date">{new Date(item.createdAt).toLocaleDateString()}</div>
                <div
                  className="activity-score"
                  style={{ color: getScoreColor(item.fitScore) }}
                >
                  {item.fitScore}
                </div>
                <ArrowRight size={14} className="activity-arrow" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="activity-empty">
            No analyses yet. Start your first mission above.
          </div>
        )}

      </motion.div>
    </DashboardLayout>
  )
}

export default Dashboard