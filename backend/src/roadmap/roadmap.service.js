const Groq = require("groq-sdk")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

exports.generateLearningPath = async (currentSkills, missingSkills, role) => {
  const gaps = missingSkills || []
  if (gaps.length === 0) return null

  const prompt = `
  You are a Senior Technical Mentor.
  The user wants to be a "${role}".
  
  CURRENT SKILLS: ${currentSkills.join(", ")}
  MISSING SKILLS (Target): ${gaps.map(s => s.skill).join(", ")}

  TASK:
  Create a step-by-step learning roadmap to bridge these gaps.
  
  RULES:
  1. DEPENDENCY ORDER: Teach foundations before advanced concepts (e.g., do not suggest "Redux" before "React").
  2. GROUPING: Group skills logically into "Weeks".
  3. RESOURCES: For each skill, suggest 1 specific search term (e.g., "React docs hooks").
  4. CONCISE: Keep descriptions short.

  EXAMPLE OUTPUT JSON SCHEMA:
  {
    "roadmap": [
      {
        "week": 1,
        "theme": "Foundations",
        "skills": [
          { 
            "name": "Skill Name", 
            "reason": "Why needed", 
            "searchQuery": "Best query to learn this" 
          }
        ]
      }
    ],
    "estimatedWeeks": 4
  }
  `

  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You represent a learning algorithm. JSON output only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      top_p: 0.1
    })

    const raw = response.choices[0]?.message?.content || ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null

  } catch (err) {
    console.error("Roadmap AI Error:", err.message)
    return null
  }
}