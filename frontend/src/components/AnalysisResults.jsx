import { Code2, Briefcase, GraduationCap, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import '../styles/Analysis.css'

const AnalysisResults = ({ data }) => {
  if (!data) return null

  return (
    <div className="analysis-results-grid">

      {/* LEFT COLUMN: Skills & Projects */}
      <div className="results-left">

        {/* SKILLS CARD */}
        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="card-header">
            <Code2 size={18} className="icon-primary" />
            <h3 className="card-title">Detected Skills</h3>
          </div>
          <div className="skills-wrapper">
            {data.skills && data.skills.length > 0 ? (
              data.skills.map((skill, index) => (
                <motion.span
                  key={index}
                  className="skill-tag"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.2 + index * 0.04 }}
                >
                  {skill}
                </motion.span>
              ))
            ) : (
              <p className="empty-text">No skills detected.</p>
            )}
          </div>
        </motion.div>

        {/* PROJECTS CARD */}
        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="card-header">
            <Layers size={18} className="icon-purple" />
            <h3 className="card-title">Projects Found</h3>
          </div>
          {data.projects && data.projects.length > 0 ? (
            data.projects.map((proj, index) => (
              <div key={index} className="project-item">
                <div className="project-title">{proj.title}</div>
                <div className="tech-stack-small">
                  {proj.tech_stack.join(" · ")}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-text">No projects extracted.</p>
          )}
        </motion.div>

      </div>

      {/* RIGHT COLUMN: Experience & Education */}
      <div className="results-right">

        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="card-header">
            <Briefcase size={18} className="icon-primary" />
            <h3 className="card-title">Experience</h3>
          </div>
          <div className="experience-value">
            {data.experience_years || 0}
          </div>
          <div className="experience-label">Years Detected</div>
        </motion.div>

        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="card-header">
            <GraduationCap size={18} className="icon-accent" />
            <h3 className="card-title">Education</h3>
          </div>
          <p className="education-text">
            {data.education || "Not specified"}
          </p>
        </motion.div>

      </div>
    </div>
  )
}

export default AnalysisResults