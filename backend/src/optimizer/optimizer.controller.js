const { optimizeBulletAI } = require("./optimizer.service")

exports.optimizeBullet = async (req, res) => {
  try {
    const { bullet, role, contextSkills } = req.body
    
    if (!bullet || typeof bullet !== "string") {
      return res.status(400).json({ error: "Original bullet point is required" })
    }

    const trimmedBullet = bullet.trim()

    // Catch obvious junk before hitting Groq to save tokens
    if (trimmedBullet.length < 5 || trimmedBullet.split(/\s+/).length < 2) {
      return res.status(400).json({ 
        error: "Input too short. Please provide a brief description of a task." 
      })
    }
    
    let userContext = null
    // Use the context skills strictly from the current frontend session
    if (contextSkills && Array.isArray(contextSkills) && contextSkills.length > 0) {
      userContext = { skills: contextSkills }
      console.log(`⚡ Enhancing optimizer with ${userContext.skills.length} active skills.`)
    }

    // Pass the context to the AI service
    const result = await optimizeBulletAI(trimmedBullet, role, userContext)
    
    // Catch AI-generated relevancy errors (like long conversational junk)
    if (result.error) {
       return res.status(400).json({ error: result.error })
    }
    
    res.json(result)
  } catch (err) {
    console.error("Bullet Optimization Error:", err)
    res.status(500).json({ error: "Failed to optimize bullet point" })
  }
}