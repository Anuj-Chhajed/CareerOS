import React, { useState, useRef, useCallback, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Loader2, Copy, CheckCircle, ArrowRight, FileEdit, Upload, FileText, RefreshCw } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import api from '../api'
import '../styles/Optimizer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const Optimizer = () => {
  const [bullet, setBullet] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [error, setError] = useState("")
  const [lastBullet, setLastBullet] = useState("")
  const [contextSkills, setContextSkills] = useState([])
  const [isExtracting, setIsExtracting] = useState(false)

  // PDF state
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pdfContainerWidth, setPdfContainerWidth] = useState(500)
  const [dragging, setDragging] = useState(false)

  // Selection state
  const [selectedText, setSelectedText] = useState("")
  const [floatBtnPos, setFloatBtnPos] = useState(null)

  const fileInputRef = useRef(null)
  const pdfContainerRef = useRef(null)
  const pdfViewerRef = useRef(null)

  const extractSkillsFromPDF = async (file) => {
    setIsExtracting(true)
    setContextSkills([])

    try {
      // 1. Parse PDF to text using existing route
      const formData = new FormData()
      formData.append("pdf", file)

      const parseRes = await api.post("/pdf/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      const text = parseRes.data.text
      
      if (text) {
        // 2. Extract skills using existing AI extraction route
        const extractRes = await api.post("/analysis/extract", { text })
        if (extractRes.data && extractRes.data.skills) {
          setContextSkills(extractRes.data.skills)
          console.log("⚡ Extracted context skills for this specific PDF:", extractRes.data.skills)
        }
      }
    } catch (err) {
      console.error("Failed to extract skills from this PDF:", err)
    } finally {
      setIsExtracting(false)
    }
  }

  // Measure PDF container width for responsive scaling
  useEffect(() => {
    const measure = () => {
      if (pdfContainerRef.current) {
        setPdfContainerWidth(pdfContainerRef.current.clientWidth - 16) // minus padding
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [pdfFile])

  // Listen for text selection — ONLY inside the PDF viewer
  useEffect(() => {
    const handleMouseUp = (e) => {
      // Only show button if selection happened inside the PDF viewer
      if (!pdfViewerRef.current || !pdfViewerRef.current.contains(e.target)) {
        setFloatBtnPos(null)
        return
      }

      const sel = window.getSelection()
      const text = sel?.toString().trim()

      if (text && text.length > 5) {
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setSelectedText(text)
        setFloatBtnPos({
          top: rect.top - 48,
          left: Math.max(10, rect.left + rect.width / 2 - 75)
        })
      } else {
        setFloatBtnPos(null)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  // PDF handlers
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setResults([])
      setBullet("")
      extractSkillsFromPDF(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setResults([])
      setBullet("")
      extractSkillsFromPDF(file)
    }
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages)

  // Use selected text from PDF
  const useSelectedText = () => {
    if (selectedText) {
      setBullet(selectedText)
      setResults([])
      setFloatBtnPos(null)
      window.getSelection()?.removeAllRanges()
    }
  }

  // Optimize handler (preserved exactly)
  const handleOptimize = async () => {
    if (!bullet.trim()) {
      setError("Please select text from the PDF or type a bullet point.")
      return
    }

    setLoading(true)
    setError("")
    setResults([])
    setLastBullet(bullet.trim())

    try {
      const res = await api.post("/optimizer/optimize", {
        bullet,
        role: role.trim() || "Software Engineer",
        contextSkills: contextSkills
      })

      if (res.data.error) {
         setError(res.data.error) // Catches the 'hello' error from AI
         return
      }

      if (res.data.variations) {
        setResults(res.data.variations)
      } else {
        setError("Failed to generate variations. Try again.")
      }
    } catch (err) {
      // Handle the custom 400 error we set up in the controller
      const errMsg = err.response?.data?.error || "Something went wrong communicating with the AI."
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <header className="optimizer-header">
          <div className="optimizer-header-top">
            <Zap size={26} className="icon-accent" />
            <h1 className="optimizer-title">Bullet Optimizer</h1>
          </div>
          <p className="optimizer-subtitle">
            Upload your resume, select any text, and get AI-powered ATS-optimized variations instantly.
          </p>
        </header>

        <div className="optimizer-split">

          {/* ═══ LEFT: PDF VIEWER ═══ */}
          <div className="optimizer-pdf-panel">
            <div className="optimizer-panel-header">
              <div className="optimizer-panel-label">
                <FileText size={14} /> Resume Preview
              </div>
              {pdfFile && (
                <span className="optimizer-panel-hint">Select text to optimize</span>
              )}
            </div>

            {!pdfFile ? (
              /* Upload zone */
              <div
                className={`optimizer-upload-zone ${dragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={onFileChange}
                />
                <div className="optimizer-upload-icon">
                  <Upload size={28} />
                </div>
                <div className="optimizer-upload-title">Drop your resume here</div>
                <div className="optimizer-upload-sub">or click to browse</div>
                <button className="optimizer-upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload size={14} /> Choose PDF
                </button>
                <div className="optimizer-upload-formats">Accepts PDF format</div>
              </div>
            ) : (
              /* PDF Rendered */
              <>
                <div className="pdf-viewer-area" ref={(el) => { pdfContainerRef.current = el; pdfViewerRef.current = el; }}>
                  <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (_, i) => (
                      <Page
                        key={i}
                        pageNumber={i + 1}
                        width={pdfContainerWidth}
                        renderTextLayer={true}
                        renderAnnotationLayer={false}
                      />
                    ))}
                  </Document>
                </div>
                <div className="pdf-controls">
                  <span className="pdf-page-info">
                    {numPages} page{numPages > 1 ? 's' : ''} loaded
                  </span>
                  <button className="pdf-replace-btn" onClick={() => { setPdfFile(null); setNumPages(null); }}>
                    <RefreshCw size={12} /> Replace PDF
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ═══ RIGHT: INPUT + RESULTS ═══ */}
          <div className="optimizer-right-panel">

            {/* Input card */}
            <div className="optimizer-input-card">
              <div className="optimizer-input-label">
                <FileEdit size={13} /> Optimize
              </div>

              {error && <div className="optimizer-error">{error}</div>}

              <div className="optimizer-field">
                <label>Bullet Point {pdfFile && <span>(select from PDF or type)</span>}</label>
                <textarea
                  className={`optimizer-textarea ${bullet && pdfFile ? 'has-selection' : ''}`}
                  placeholder={pdfFile ? 'Select text from your resume on the left...' : 'e.g., "Fixed bugs in the backend server"'}
                  value={bullet}
                  onChange={(e) => setBullet(e.target.value)}
                />
              </div>

              <div className="optimizer-field">
                <label>Target Role <span>(Optional)</span></label>
                <input
                  type="text"
                  className="optimizer-input"
                  placeholder='e.g., "Senior Node.js Developer"'
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOptimize()}
                />
              </div>

              <button
                className="optimizer-submit"
                onClick={handleOptimize}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Optimizing...</>
                ) : (
                  <><Zap size={18} /> Generate Power Bullets</>
                )}
              </button>
            </div>

            {/* Results */}
            {!loading && results.length === 0 && (
              <div className="optimizer-empty">
                <div className="optimizer-empty-icon">
                  <ArrowRight size={24} />
                </div>
                <p>{pdfFile ? 'Select text from your resume and hit Optimize.' : 'Upload a resume to get started, or type a bullet above.'}</p>
              </div>
            )}

            {loading && (
              <div className="optimizer-loading">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="optimizer-loading-spinner"
                >
                  <Loader2 size={40} />
                </motion.div>
                <div className="optimizer-loading-text">Crafting power bullets...</div>
              </div>
            )}

            {results.length > 0 && (
              <div className="optimizer-results-section">
                <motion.div
                  className="original-bullet"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="original-bullet-label">Original</div>
                  <p className="original-bullet-text">{lastBullet}</p>
                </motion.div>

                <div className="comparison-strip">
                  <span className="comparison-label label-original">Before</span>
                  <span className="comparison-label label-optimized">After — AI Optimized</span>
                </div>

                {results.map((resText, index) => (
                  <motion.div
                    key={index}
                    className="variation-card"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                  >
                    <div className="variation-header">
                      <span className="variation-badge">Variation {index + 1}</span>
                      <button
                        className={`variation-copy ${copiedIndex === index ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(resText, index)}
                      >
                        {copiedIndex === index ? (
                          <><CheckCircle size={14} /> Copied</>
                        ) : (
                          <><Copy size={14} /> Copy</>
                        )}
                      </button>
                    </div>
                    <p className="variation-text">{resText}</p>
                  </motion.div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Floating "Use Selection" button — appears when user selects text in PDF */}
        <AnimatePresence>
          {floatBtnPos && (
            <motion.button
              className="selection-float-btn"
              style={{ top: floatBtnPos.top, left: floatBtnPos.left }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={useSelectedText}
            >
              <Zap size={14} /> Optimize This
            </motion.button>
          )}
        </AnimatePresence>

      </motion.div>
    </DashboardLayout>
  )
}

export default Optimizer