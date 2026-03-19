import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { motion } from 'framer-motion'
import { Map, Loader2, Rocket, AlertCircle, Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import api from '../api'
import '../styles/Roadmap.css'

const Roadmap = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode") || "generate"

  const [analysisData, setAnalysisData] = useState(null)
  const [roadmapData, setRoadmapData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (mode === "view") {
          const res = await api.get(`/roadmap/${id}`)
          setRoadmapData(res.data)
        } else {
          const res = await api.get(`/career/analysis/${id}`)
          setAnalysisData(res.data)
        }
      } catch (err) {
        console.error(err)
        setError(`Failed to load data.`)
      } finally {
        setPageLoading(false)
      }
    }
    if (id) fetchData()
  }, [id, mode])

  const generateRoadmap = async () => {
    if (!analysisData) return
    setLoading(true)
    setError("")

    try {
      const res = await api.post("/roadmap/generate", {
        role: analysisData.targetRole,
        currentSkills: analysisData.extractedSkills || [],
        missingSkills: analysisData.missingSkills || [],
        analysisId: id,
        forceRefresh: false
      })
      setRoadmapData(res.data)
    } catch (err) {
      console.error(err)
      setError("Failed to generate roadmap.")
    } finally {
      setLoading(false)
    }
  };

  // Collect skills lists for the overview panel
  const currentSkills = analysisData?.extractedSkills || roadmapData?.currentSkills || []
  const missingSkills = analysisData?.missingSkills?.map(s => s.skill || s) || roadmapData?.missingSkills || []
  const targetRole = analysisData?.targetRole || roadmapData?.role || "Developer"

  if (pageLoading) return (
    <DashboardLayout>
      <div className="roadmap-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="roadmap-loading-spinner"
        >
          <Loader2 size={48} />
        </motion.div>
        <div className="roadmap-loading-title">Loading Roadmap...</div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <header className="roadmap-page-header">
          <div className="roadmap-header-top">
            <Map size={26} className="icon-primary" />
            <h1 className="roadmap-page-title">Career Trajectory</h1>
          </div>
          <p className="roadmap-page-subtitle">
            {mode === 'view'
              ? "Your saved learning path."
              : "Your personalized flight plan to close skill gaps."}
          </p>
        </header>

        {error && (
          <div className="roadmap-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* ═══ GENERATE PROMPT ═══ */}
        {!roadmapData && !loading && !error && mode === "generate" && (
          <>
            {/* Hero: Target Role */}
            <motion.div
              className="roadmap-hero"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="roadmap-hero-label">Target Role</div>
              <div className="roadmap-hero-role">{targetRole}</div>
              <div className="roadmap-hero-meta">
                {currentSkills.length > 0 && (
                  <div className="roadmap-hero-stat">
                    <CheckCircle size={16} className="icon-primary" />
                    <strong>{currentSkills.length}</strong> skills matched
                  </div>
                )}
                {missingSkills.length > 0 && (
                  <div className="roadmap-hero-stat">
                    <XCircle size={16} style={{ color: '#ef4444' }} />
                    <strong>{missingSkills.length}</strong> gaps to close
                  </div>
                )}
              </div>
            </motion.div>

            {/* Skills Overview: Have vs Need */}
            {(currentSkills.length > 0 || missingSkills.length > 0) && (
              <motion.div
                className="skills-overview"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="skills-panel">
                  <div className="skills-panel-title">
                    <CheckCircle size={14} className="icon-primary" /> You Have
                  </div>
                  <div className="skills-panel-tags">
                    {currentSkills.length > 0
                      ? currentSkills.map((s, i) => <span key={i} className="skill-pill skill-pill-have">{s}</span>)
                      : <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>None detected</span>}
                  </div>
                </div>
                <div className="skills-panel">
                  <div className="skills-panel-title">
                    <XCircle size={14} style={{ color: '#ef4444' }} /> You Need
                  </div>
                  <div className="skills-panel-tags">
                    {missingSkills.length > 0
                      ? missingSkills.map((s, i) => <span key={i} className="skill-pill skill-pill-need">{s}</span>)
                      : <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No gaps found</span>}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="roadmap-generate"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="roadmap-generate-icon">
                <Rocket size={34} />
              </div>
              <h3>Ready to chart your course?</h3>
              <p>
                We'll create a week-by-week learning plan tailored to close your skill gaps for {targetRole}.
              </p>
              <button className="btn btn-primary" onClick={generateRoadmap}>
                Generate My Roadmap
              </button>
            </motion.div>
          </>
        )}

        {/* ═══ LOADING DURING GENERATION ═══ */}
        {loading && (
          <div className="roadmap-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="roadmap-loading-spinner"
            >
              <Loader2 size={48} />
            </motion.div>
            <div className="roadmap-loading-title">Calculating optimal learning path...</div>
            <div className="roadmap-loading-sub">Analyzing skill gaps and building your flight plan.</div>
          </div>
        )}

        {/* ═══ ROADMAP DISPLAY ═══ */}
        {roadmapData && roadmapData.roadmap && (
          <>
            {/* Hero: Target Role */}
            <motion.div
              className="roadmap-hero"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="roadmap-hero-label">Flight Plan For</div>
              <div className="roadmap-hero-role">{roadmapData.role || targetRole}</div>
              <div className="roadmap-hero-meta">
                <div className="roadmap-hero-stat">
                  <Clock size={16} className="icon-primary" />
                  <strong>{roadmapData.estimatedWeeks} weeks</strong> estimated
                </div>
                <div className="roadmap-hero-stat">
                  <BookOpen size={16} className="icon-primary" />
                  <strong>{roadmapData.roadmap.length} phases</strong> to complete
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <div className="roadmap-container">
              <div className="timeline">
                {roadmapData.roadmap.map((weekData, index) => (
                  <motion.div
                    key={index}
                    className="timeline-week"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="week-marker">{weekData.week}</div>
                    <div className="week-header">
                      <h3 className="week-title">Week {weekData.week}: {weekData.theme}</h3>
                      <span className="week-badge">{weekData.skills.length} skills</span>
                    </div>
                    {weekData.skills.map((skill, sIdx) => (
                      <motion.div
                        key={sIdx}
                        className="skill-card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + sIdx * 0.05 }}
                      >
                        <div className="skill-header">
                          <span className="skill-name">{skill.name}</span>
                        </div>
                        <p className="skill-reason">{skill.reason}</p>
                        <div className="skill-search-row">
                          <span className="skill-search-label">Search:</span>
                          <span className="search-query-badge">"{skill.searchQuery}"</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

      </motion.div>
    </DashboardLayout>
  )
}

export default Roadmap