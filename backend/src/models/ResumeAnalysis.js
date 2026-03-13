const mongoose = require("mongoose")

const resumeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetRole: { type: String, required: true },
  resumeHash: { type: String, required: true },
  extractedSkills: [String],
  experienceYears: Number,
  projects: Array,
  fitScore: Number,
  missingSkills: Array,
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap", default: null },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema)