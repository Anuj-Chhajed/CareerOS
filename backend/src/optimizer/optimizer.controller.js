const { optimizeBulletAI } = require("./optimizer.service")
const ResumeAnalysis = require("../models/ResumeAnalysis")

exports.optimizeBullet = async (req, res) => {
  try {
    const { bullet, role } = req.body
    const userId = req.user.id

    if (!bullet) {
      return res.status(400).json({ error: "Original bullet point is required" })
    }

    // SILENTLY FETCH CONTEXT: Get the user's most recent resume analysis
    const latestAnalysis = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 })
    
    let userContext = null
    if (latestAnalysis && latestAnalysis.extractedSkills) {
      userContext = {
        skills: latestAnalysis.extractedSkills,
        experience: latestAnalysis.experienceYears
      }
      console.log(`⚡ Enhancing optimizer with ${userContext.skills.length} known skills.`)
    }

    // Pass the context to the AI service
    const result = await optimizeBulletAI(bullet, role, userContext)
    
    res.json(result)
  } catch (err) {
    console.error("Bullet Optimization Error:", err)
    res.status(500).json({ error: "Failed to optimize bullet point" })
  }
}