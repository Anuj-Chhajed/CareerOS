import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import ScoreCard from '../components/ScoreCard'
import AnalysisResults from '../components/AnalysisResults'
import { Loader2, ArrowRight, ArrowLeft, Map } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../api'
import '../styles/Analysis.css'

const Analysis = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/career/analysis/${id}`)
        setData(res.data)
      } catch (err) {
        console.error("Fetch Error:", err)
        setError("Failed to load analysis. It may not exist.")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchAnalysis()
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="analysis-loading">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="upload-spinner"
          >
            <Loader2 size={48} />
          </motion.div>
          <h3 className="loading-title">Loading Analysis...</h3>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="error-container">
          <h2 className="error-title">{error || "Analysis not found."}</h2>
          <Link to="/dashboard/analyze" className="error-link">
            <ArrowLeft size={16} /> Go back to Analyzer
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const scoreData = {
    finalScore: data.fitScore || 0,
    missingSkills: data.missingSkills || []
  }

  const extractedData = {
    skills: data.extractedSkills || [],
    experience_years: data.experienceYears || 0,
    projects: data.projects || []
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/dashboard/history" className="breadcrumb-link">My History</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{data.targetRole}</span>
        </div>

        <header className="analysis-header">
          <h1 className="analysis-page-title">Analysis Results</h1>
          <p className="analysis-target-role">
            Target Role: <span>{data.targetRole}</span>
          </p>
          {data.createdAt && (
            <p className="analysis-date">
              {new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </header>

        <ScoreCard scoreData={scoreData} />

        {/* CTA to Roadmap */}
        <div className="roadmap-cta">
          <Link to={`/dashboard/roadmap/${data._id}`} className="roadmap-cta-btn">
            <Map size={18} /> Generate Learning Roadmap <ArrowRight size={18} />
          </Link>
        </div>

        <AnalysisResults data={extractedData} />

      </motion.div>
    </DashboardLayout>
  )
}

export default Analysis