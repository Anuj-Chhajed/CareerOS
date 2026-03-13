const Groq = require("groq-sdk")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

exports.optimizeBulletAI = async (originalBullet, targetRole, userContext) => {
  
  let contextString = ""
  if (userContext && userContext.skills && userContext.skills.length > 0) {
    contextString = `
USER CONTEXT (USE IF RELEVANT):
- Known Skills: ${userContext.skills.join(", ")}

*CRITICAL RULE: If the original bullet is vague, use ONLY 1 or 2 of these Known Skills to make it specific. DO NOT stuff the bullet with every skill on this list.*
    `
  }

  const prompt = `
You are an Expert Technical Resume Reviewer.
Your task is to take a weak resume bullet point and rewrite it into 3 strong, authentic, ATS-friendly variations.

INPUT:
- Target Role: ${targetRole || "Software Engineer"}
- Original Bullet: "${originalBullet}"
${contextString}

STRICT WRITING RULES:
1. NO HALLUCINATIONS (CRITICAL): DO NOT invent fake metrics, numbers, or percentages. If the original bullet lacks numbers, use placeholders like "[X]%" or "[Number]", OR focus entirely on the qualitative technical impact (e.g., "resulting in improved system scalability").
2. TONE: Professional, authentic, and clear. ABSOLUTELY NO overly aggressive corporate jargon (Avoid words like "Spearheaded", "Synergized", "Revolutionized").
3. STRUCTURE: Use "Action Verb + Technical Implementation + Why/How it mattered".
4. VARIETY: 
   - Variation 1: Technical Depth (Focus strictly on the architecture and tools used).
   - Variation 2: Impact & Value (Focus on the problem solved for the user/business).
   - Variation 3: Concise & Direct (Short, punchy, and straight to the point without filler words).

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON.
- Do NOT include markdown formatting (like \`\`\`json).
- Do NOT include any conversational text.

OUTPUT JSON SCHEMA:
{
  "variations": [
    "<Variation 1 text>",
    "<Variation 2 text>",
    "<Variation 3 text>"
  ]
}
`

  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are a JSON-only resume optimization API." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1 
    })

    const raw = response.choices[0]?.message?.content || "{}"
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      return { variations: ["Could not optimize bullet point at this time. Please try again."] }
    }

    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error("Optimizer AI Error:", err)
    throw new Error("Failed to optimize bullet")
  }
}