import { CheckCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import '../styles/Analysis.css'

const ScoreCard = ({ scoreData }) => {
  if (!scoreData) return null

  const { finalScore, missingSkills } = scoreData

  const getColor = (s) => {
    if (s >= 80) return 'var(--primary)'
    if (s >= 50) return 'var(--accent)'
    return '#ef4444'
  }

  const getLabel = (s) => {
    if (s >= 80) return 'Strong Match'
    if (s >= 50) return 'Moderate Fit'
    return 'Needs Improvement'
  }

  const scoreColor = getColor(finalScore)

  return (
    <div className="score-section">

      {/* SCORE GAUGE */}
      <motion.div
        className="score-gauge-card"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h3 className="score-gauge-title">ATS Fit Score</h3>

        <div className="score-ring-container">
          <svg className="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <motion.circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={scoreColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="326.73"
              initial={{ strokeDashoffset: 326.73 }}
              animate={{ strokeDashoffset: 326.73 - (326.73 * finalScore) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="score-ring-value">
            <span className="score-ring-number">{finalScore}</span>
            <span className="score-ring-sub">/ 100</span>
          </div>
        </div>

        <div className="score-ring-label" style={{ color: scoreColor }}>
          {getLabel(finalScore)}
        </div>
        <p className="score-ring-source">Based on live market data</p>
      </motion.div>

      {/* SKILL GAPS */}
      <motion.div
        className="skill-gaps-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card-header">
          <AlertTriangle size={18} className="icon-accent" />
          <h3 className="card-title">Skill Gaps</h3>
        </div>

        {missingSkills && missingSkills.length > 0 ? (
          <div className="skill-gaps-list">
            {missingSkills.map((item, idx) => (
              <motion.div
                key={idx}
                className="skill-gap-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + idx * 0.08 }}
              >
                <span className="skill-gap-name">{item.skill}</span>
                <span className="skill-gap-badge">Critical</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="skill-gaps-empty">
            <CheckCircle size={40} />
            <p>No critical gaps found! You're a strong match.</p>
          </div>
        )}
      </motion.div>

    </div>
  )
}

export default ScoreCard