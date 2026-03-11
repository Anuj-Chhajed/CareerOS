const { computeFitScoreAI } = require("./scoring.service")
const { getBenchmarkForRole } = require("../benchmarks/benchmark.service")
const ResumeAnalysis = require("../models/ResumeAnalysis")
const crypto = require("crypto")

exports.getFitScore = async (req, res) => {
  try {
    // 1. Extract rawText from the request body
    const { resumeData, role, rawText } = req.body;
    const userId = req.user.id;

    if (!resumeData || !role) {
      return res.status(400).json({ error: "Resume data and Role are required" });
    }

    // 2. HASH THE RAW PDF TEXT, NOT THE AI JSON!
    // Fallback to stringified resumeData just in case rawText is missing
    const textToHash = rawText ? rawText : JSON.stringify(resumeData)
    const hashInput = textToHash + role.toLowerCase()
    
    const resumeHash = crypto.createHash("sha256").update(hashInput).digest("hex")

    // 3. CHECK THE CACHE
    const existingAnalysis = await ResumeAnalysis.findOne({ userId, resumeHash })
    
    if (existingAnalysis) {
      console.log("⚡ Cache Hit! Returning saved AI score.")
      return res.json({ 
        finalScore: existingAnalysis.fitScore,
        missingSkills: existingAnalysis.missingSkills,
        benchmarkedRole: existingAnalysis.targetRole,
        analysisId: existingAnalysis._id,
        isCached: true
      })
    }

    console.log(`🔍 No cache found. Calling AI for: "${role}"`)

    const benchmark = await getBenchmarkForRole(role)
    if (!benchmark) {
      return res.status(404).json({ error: "Market data unavailable for this role" })
    }

    const result = await computeFitScoreAI(resumeData, benchmark)
    const topMissingSkills = result.missingSkills ? result.missingSkills.slice(0, 5) : []

    const savedAnalysis = await ResumeAnalysis.create({
      userId,
      targetRole: role,
      resumeHash,
      extractedSkills: resumeData.skills || [],
      experienceYears: resumeData.experience_years || 0,
      projects: resumeData.projects || [],
      fitScore: result.finalScore,
      missingSkills: topMissingSkills
    })

    res.json({ 
      ...result, 
      benchmarkedRole: role,
      analysisId: savedAnalysis._id 
    })

  } catch (err) {
    console.error("Scoring Controller Error:", err)
    res.status(500).json({ error: "Scoring failed" })
  }
}

exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    })

    if (!analysis) return res.status(404).json({ error: "Analysis not found" })

    res.json(analysis)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analysis" })
  }
}

exports.getAnalysisHistory = async (req, res) => {
  try {
    const history = await ResumeAnalysis.find({ userId: req.user.id })
                                        .sort({ createdAt: -1 })
                                        .select("targetRole fitScore createdAt roadmapId")
    res.json(history)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" })
  }
}