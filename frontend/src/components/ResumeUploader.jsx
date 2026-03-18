import React, { useCallback, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import '../styles/Analysis.css'

const ResumeUploader = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [])

  const handleFile = async (file) => {
    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file.")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("pdf", file)

      const res = await api.post("/pdf/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      console.log("Parsed Text:", res.data.text)

      onUploadSuccess({
        file: file,
        text: res.data.text,
        pages: res.data.pages
      })

    } catch (err) {
      console.error("Upload Error:", err)
      alert("Failed to parse resume. Check backend console.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <AnimatePresence mode='wait'>
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="upload-state"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="upload-spinner"
            >
              <Loader2 size={48} />
            </motion.div>
            <h3 className="upload-title">Parsing Resume...</h3>
            <p className="upload-subtitle">Extracting text and structure</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="upload-state"
          >
            <div className="upload-icon-wrapper">
              <UploadCloud size={32} />
            </div>
            <h3 className="upload-title">Upload your Resume</h3>
            <p className="upload-subtitle">
              Drag & drop your PDF here, or click to browse
            </p>
            <label className="upload-btn">
              Browse Files
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
            <p className="upload-formats">Accepted: PDF only · Max 5MB</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ResumeUploader