const express = require("express")
const cors = require("cors")
require("dotenv").config()
const pdfRoutes = require("./pdf/pdf.routes")
const analysisRoutes = require("./analysis/analysis.routes")
const careerRoutes = require("./career/career.routes")
const benchmarkRoutes = require("./benchmarks/benchmark.routes")
const roadmapRoutes = require("./roadmap/roadmap.routes")
const optimizerRoutes = require("./optimizer/optimizer.routes")
const authRoutes = require("./auth/auth.routes")
const { connectDB } = require("./config/db")
const PORT = process.env.PORT || 4000

const app = express()

connectDB()
app.use(cors())

app.use(express.json())
app.use("/api/pdf", pdfRoutes)
app.use("/api/analysis", analysisRoutes)
app.use("/api/career", careerRoutes)
app.use("/api/market", benchmarkRoutes)
app.use("/api/roadmap", roadmapRoutes)
app.use("/api/optimizer", optimizerRoutes)
app.use("/api/auth", authRoutes)

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({success: false, message: err.message || 'Something went wrong!', data: null})
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})