import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UploadCloud, Cpu, TrendingUp, ChevronDown, LayoutDashboard,
  Search, Zap, Map, BarChart3, Target
} from 'lucide-react'
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa"
import { motion } from "framer-motion"
import Reveal from "../components/Reveal"
import '../styles/Landing.css'

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"))
  }, [])

  return (
    <div className="landing-page">

      {/* ───── 1. Navbar ───── */}
      <motion.nav
        className="landing-navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="content-wrapper nav-content">
          <Link to="/" className="brand-logo">Career<span className="brand-accent">OS</span></Link>
          <div className="nav-actions">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn btn-primary">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Log In</Link>
                <Link to="/signup" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ───── 2. Hero — "The Briefing" ───── */}
      <section className="hero-section">
        <div className="hero-ambient-glow"></div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <h1 className="hero-headline">Your resume, decoded.</h1>
          <p className="hero-subtext">
            We analyze your resume against real-time job descriptions from the market and tell you exactly where you stand.
          </p>
          <Link to={isLoggedIn ? "/dashboard/analyze" : "/signup"} className="btn btn-primary btn-hero">
            Begin Analysis
          </Link>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <ChevronDown size={24} className="chevron-bounce" />
        </motion.div>
      </section>

      {/* ───── 3. How It Works — "Three Phases" ───── */}
      <section className="phases-section">
        <div className="content-wrapper">
          <div className="phases-grid">

            <Reveal>
              <div className="phase-card phase-offset-1">
                <div className="phase-icon-box">
                  <UploadCloud size={24} />
                </div>
                <span className="phase-label">Phase 01</span>
                <h3 className="phase-title">Upload</h3>
                <p className="phase-desc">
                  Drop your resume PDF. Our AI parser extracts your skills, experience, projects, and education instantly.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="phase-card phase-offset-2">
                <div className="phase-icon-box">
                  <Cpu size={24} />
                </div>
                <span className="phase-label">Phase 02</span>
                <h3 className="phase-title">Analyze</h3>
                <p className="phase-desc">
                  Enter your target role. We fetch 10 live job descriptions and benchmark your resume against real market demand.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="phase-card phase-offset-3">
                <div className="phase-icon-box">
                  <TrendingUp size={24} />
                </div>
                <span className="phase-label">Phase 03</span>
                <h3 className="phase-title">Elevate</h3>
                <p className="phase-desc">
                  Get your fit score, missing skills, an AI-generated learning roadmap, and rewritten resume bullets.
                </p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ───── 4. Features — What You Get ───── */}
      <section className="features-section">
        <div className="content-wrapper">
          <Reveal>
            <div className="features-header">
              <h2 className="features-headline">Everything you need to land the role.</h2>
              <p className="features-subtext">Not just a score — a complete career toolkit.</p>
            </div>
          </Reveal>

          <div className="features-grid">

            <Reveal>
              <div className="feature-card">
                <div className="feature-icon"><Search size={22} /></div>
                <h4 className="feature-title">Real-Time Market Scoring</h4>
                <p className="feature-desc">
                  Your resume is scored against 10 live job descriptions fetched from the market — not static keyword matching.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="feature-card">
                <div className="feature-icon"><Target size={22} /></div>
                <h4 className="feature-title">Skill Gap Detection</h4>
                <p className="feature-desc">
                  We identify the exact hard technical skills you're missing that would block you from landing the role.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="feature-card">
                <div className="feature-icon"><Map size={22} /></div>
                <h4 className="feature-title">AI Learning Roadmap</h4>
                <p className="feature-desc">
                  Get a week-by-week learning plan with prioritized skills and resources to close your gaps.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="feature-card">
                <div className="feature-icon"><Zap size={22} /></div>
                <h4 className="feature-title">Bullet Optimizer</h4>
                <p className="feature-desc">
                  Paste any weak resume bullet and get 3 ATS-friendly rewrites using the XYZ impact formula.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="feature-card">
                <div className="feature-icon"><BarChart3 size={22} /></div>
                <h4 className="feature-title">Analysis History</h4>
                <p className="feature-desc">
                  Track every analysis. Compare scores across roles. See your improvement over time.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="feature-card">
                <div className="feature-icon"><Cpu size={22} /></div>
                <h4 className="feature-title">Smart Resume Parsing</h4>
                <p className="feature-desc">
                  AI reads beyond your skills section — scanning projects, experience, and summaries to build a complete profile.
                </p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ───── 5. Live Demo / Feature Showcase ───── */}
      <section className="demo-section">
        <div className="content-wrapper">
          <Reveal>
            <div className="demo-card">

              {/* Score Ring — matches ScoreCard.jsx */}
              <div className="demo-score-area">
                <div className="demo-score-header">ATS Fit Score</div>
                <div className="score-ring-container">
                  <svg className="score-ring" viewBox="0 0 120 120">
                    <circle className="score-ring-bg" cx="60" cy="60" r="52" />
                    <circle className="score-ring-fill" cx="60" cy="60" r="52" />
                  </svg>
                  <div className="score-ring-value">
                    <span>82</span>
                    <span className="score-ring-sub">/ 100</span>
                  </div>
                </div>
                <span className="score-ring-label">Based on live market data</span>
              </div>

              {/* Right side — Skill Gaps + Detected Skills */}
              <div className="demo-details">

                {/* Skill Gaps — matches ScoreCard.jsx */}
                <div className="demo-gaps-section">
                  <div className="demo-section-title">Skill Gaps</div>
                  <div className="demo-gap-list">
                    <div className="demo-gap-item">
                      <span className="demo-gap-name">Docker</span>
                      <span className="demo-gap-badge">Critical</span>
                    </div>
                    <div className="demo-gap-item">
                      <span className="demo-gap-name">Kubernetes</span>
                      <span className="demo-gap-badge">Critical</span>
                    </div>
                    <div className="demo-gap-item">
                      <span className="demo-gap-name">Redis</span>
                      <span className="demo-gap-badge">Critical</span>
                    </div>
                  </div>
                </div>

                {/* Detected Skills — matches AnalysisResults.jsx */}
                <div className="demo-detected-section">
                  <div className="demo-section-title">Detected Skills</div>
                  <div className="demo-skills">
                    <span className="skill-tag skill-matched">React</span>
                    <span className="skill-tag skill-matched">Node.js</span>
                    <span className="skill-tag skill-matched">TypeScript</span>
                    <span className="skill-tag skill-matched">MongoDB</span>
                    <span className="skill-tag skill-matched">Express</span>
                  </div>
                </div>

              </div>


            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── 6. Trust Bar ───── */}
      <Reveal>
        <section className="trust-bar">
          <div className="content-wrapper">
            <p className="trust-text">
              <span>Powered by AI</span>
              <span className="trust-sep">·</span>
              <span>10 Live JDs per Analysis</span>
              <span className="trust-sep">·</span>
              <span>Real-Time Market Data</span>
            </p>
          </div>
        </section>
      </Reveal>

      {/* ───── 7. Final CTA ───── */}
      <section className="final-cta-section">
        <div className="content-wrapper">
          <Reveal>
            <div className="final-cta-content">
              <h2 className="final-cta-headline">Your next role is closer than you think.</h2>
              <p className="final-cta-subtext">
                Stop sending resumes into the void. Know your score before you apply.
              </p>
              <Link to={isLoggedIn ? "/dashboard/analyze" : "/signup"} className="btn btn-primary btn-hero">
                Begin Your Mission
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── 8. Footer ───── */}
      <footer className="landing-footer">
        <div className="content-wrapper">
          <div className="footer-grid">
            <div>
              <div className="brand-logo" style={{ marginBottom: '1rem' }}>
                Career<span className="brand-accent">OS</span>
              </div>
              <p className="footer-tagline">
                AI-powered resume analysis against real-time market data.
              </p>
            </div>

            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 CareerOS
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage
