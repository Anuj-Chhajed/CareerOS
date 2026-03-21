import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import ResumeUploader from '../components/ResumeUploader'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Search, Rocket, CheckCircle, Scan, Brain, Target } from 'lucide-react'
import api from '../api'
import '../styles/Analysis.css'

const STREAM_STEPS = [
  { icon: <Scan size={14} />, label: 'Parsing resume structure…', preview: null },
  { icon: <Brain size={14} />, label: 'Extracting skills & experience…', preview: null },
  { icon: <Target size={14} />, label: 'Building your profile…', preview: null }
]

const Analyze = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [role, setRole] = useState("")
  const [step, setStep] = useState('upload') // 'upload' | 'analyzing' | 'role-input' | 'scoring'
  const [rawText, setRawText] = useState("")
  const [streamIdx, setStreamIdx] = useState(-1)
  const streamTimer = useRef(null)

  // Simulate the live analysis stream
  useEffect(() => {
    if (step === 'analyzing') {
      setStreamIdx(0)
      let idx = 0
      streamTimer.current = setInterval(() => {
        idx++
        if (idx < STREAM_STEPS.length) {
          setStreamIdx(idx)
        } else {
          clearInterval(streamTimer.current)
        }
      }, 1200)
    }
    return () => clearInterval(streamTimer.current)
  }, [step])

  // Handle File Upload & AI Extraction
  const handleUploadSuccess = async (uploadData) => {
    setFile(uploadData.file)
    setRawText(uploadData.text)
    setStep('analyzing')

    try {
      const res = await api.post("/analysis/extract", { text: uploadData.text })
      setAnalysis(res.data)
      clearInterval(streamTimer.current)
      setStreamIdx(STREAM_STEPS.length) // mark all done
      // Short delay so user sees completed stream
      setTimeout(() => setStep('role-input'), 600)
    } catch (err) {
      console.error("Analysis Failed:", err)
      alert("AI extraction failed.")
      setStep('upload')
    }
  }

  // Handle Scoring & Save to DB
  const handleScore = async () => {
    if (!role.trim()) return
    setStep('scoring')

    try {
      const res = await api.post("/career/score", {
        resumeData: analysis,
        role: role,
        rawText: rawText
      })

      navigate(`/dashboard/analysis/${res.data.analysisId}`)

    } catch (err) {
      console.error("Scoring Failed:", err)
      alert("Market comparison failed.")
      setStep('role-input')
    }
  }

  const stepData = [
    { key: 'upload', label: 'Upload' },
    { key: 'role-input', label: 'Target Role' },
    { key: 'scoring', label: 'Results' }
  ]

  const activeIdx = step === 'upload' ? 0 : step === 'analyzing' ? 0 : step === 'role-input' ? 1 : 2

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <header className="analyze-header">
          <div className="analyze-header-top">
            <Rocket size={26} className="icon-primary" />
            <h1 className="analyze-title">New Analysis</h1>
          </div>
          <p className="analyze-subtitle">
            Upload your resume and enter a target role to get your ATS fit score.
          </p>
        </header>

        {/* Step Progress */}
        <div className="step-progress">
          {stepData.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={`step-node ${i <= activeIdx ? 'step-done' : ''} ${i === activeIdx ? 'step-active' : ''}`}>
                <div className="step-circle">
                  {i < activeIdx ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < stepData.length - 1 && (
                <div className={`step-line ${i < activeIdx ? 'step-line-done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* 1. UPLOADER */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
              <ResumeUploader onUploadSuccess={handleUploadSuccess} />
            </motion.div>
          )}

          {/* 2. LIVE ANALYSIS STREAM */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              className="analysis-stream"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress bar */}
              <div className="stream-progress-bar">
                <motion.div
                  className="stream-progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(((streamIdx + 1) / STREAM_STEPS.length) * 100, 100)}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>

              <div className="stream-steps">
                {STREAM_STEPS.map((s, i) => {
                  const status = i < streamIdx ? 'step-resolved' : i === streamIdx ? 'step-active' : 'step-pending';
                  return (
                    <motion.div
                      key={i}
                      className={`stream-step ${status}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.15 }}
                    >
                      <div className="stream-icon">
                        {i < streamIdx ? <CheckCircle size={14} /> : s.icon}
                      </div>
                      <div className="stream-body">
                        <div className="stream-label">{s.label}</div>
                        {i < streamIdx && s.preview && (
                          <div className="stream-preview">{s.preview}</div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 3. SCORING LOADING */}
          {step === 'scoring' && (
            <motion.div
              key="scoring"
              className="analysis-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="upload-spinner"
              >
                <Loader2 size={48} />
              </motion.div>
              <h3 className="loading-title">Scanning Job Market...</h3>
              <p className="loading-subtitle">
                Comparing your skills against live {role} positions.
              </p>
            </motion.div>
          )}

          {/* 4. ROLE INPUT */}
          {step === 'role-input' && (
            <motion.div
              key="role-input"
              className="role-input-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="role-success-icon">
                <CheckCircle size={28} />
              </div>
              <h3 className="role-input-title">Resume Parsed Successfully!</h3>
              {file && (
                <div className="uploaded-file-badge">
                  📄 {file.name}
                </div>
              )}
              <p className="role-input-desc">
                Now tell us the role you're targeting so we can calculate your market fit.
              </p>

              <div className="role-input-row">
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer, Data Scientist"
                  className="role-input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScore()}
                  autoFocus
                />
                <button className="btn btn-primary role-input-btn" onClick={handleScore}>
                  <Search size={18} /> Analyze
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  )
}

export default Analyze