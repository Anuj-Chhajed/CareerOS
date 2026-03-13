const Roadmap = require("./roadmap.model")
const ResumeAnalysis = require("../models/ResumeAnalysis")
const { generateLearningPath } = require("./roadmap.service")

exports.getRoadmap = async (req, res) => {
  try {
    const { currentSkills, missingSkills, role, forceRefresh, analysisId } = req.body
    const userId = req.user.id

    if (!role || !analysisId) return res.status(400).json({ error: "Role and Analysis ID required" })

    // 1. Check DB (Now checking userId too!)
    const existingRoadmap = await Roadmap.findOne({ analysisId, userId })
    if (existingRoadmap && !forceRefresh) return res.json(existingRoadmap)

    // 2. Generate
    if (!missingSkills || missingSkills.length === 0) return res.json({ message: "No gaps found" })

    const aiResponse = await generateLearningPath(currentSkills, missingSkills, role)
    if (!aiResponse) return res.status(500).json({ error: "Generation failed" })

    // 3. Save Roadmap (Now saving userId!)
    const newRoadmap = await Roadmap.findOneAndUpdate(
      { analysisId, userId },
      { ...aiResponse, role: role.toLowerCase(), analysisId, userId, createdAt: new Date() },
      { upsert: true, new: true }
    )

    // 4. Update Analysis DB
    await ResumeAnalysis.findByIdAndUpdate(analysisId, { roadmapId: newRoadmap._id })

    res.json(newRoadmap)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server Error" })
  }
}

exports.getAllRoadmaps = async (req, res) => {
  try {
    // FIX: Only fetch roadmaps belonging to this specific user!
    const roadmaps = await Roadmap.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(roadmaps)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roadmaps" })
  }
}

exports.getRoadmapById = async (req, res) => {
  try {
    // FIX: Ensure the user requesting the roadmap actually owns it!
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user.id })
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found or unauthorized" })
    res.json(roadmap)
  } catch (err) {
    res.status(500).json({ error: "Server Error" })
  }
}