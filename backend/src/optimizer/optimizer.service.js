const Groq = require("groq-sdk")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

exports.optimizeBulletAI = async (originalBullet, targetRole, userContext) => {
  
  let contextString = ""
  if (userContext && userContext.skills && userContext.skills.length > 0) {
    contextString = `
AVAILABLE USER SKILLS: ${userContext.skills.join(", ")}
*INSTRUCTION:* If the original bullet lacks technical specifics, intelligently weave in 1 or 2 of these skills ONLY IF they make logical sense for the task. Do not force them.
    `
  }

  const prompt = `
You are an Elite Technical Resume Writer and ATS Optimization Expert.
Your singular goal is to transform weak, vague, or poorly written resume bullet points into highly impactful, interview-winning achievements.

### INPUT DATA
- Target Role: ${targetRole || "Software Engineer"}
- Original Bullet: "${originalBullet}"
${contextString}

### RELEVANCY GUARDRAIL (CRITICAL)
If the "Original Bullet" is a basic greeting (e.g., "hello", "hi", "test"), a conversational question, or complete gibberish, you MUST reject it. 
Do not attempt to optimize it. Instead, return EXACTLY this JSON:
{ "error": "Input not recognized as a valid professional task. Please provide a brief description of what you built or achieved." }

### OPTIMIZATION FRAMEWORK & RULES
If the input is valid, generate 3 distinct variations following these strict rules:

1. PRESERVE CORE MEANING (CRITICAL): You MUST keep the primary subject or feature of the "Original Bullet". For example, if the original mentions an "AI interviewer", all variations MUST clearly mention the AI interviewer. Do not delete the core human impact to make room for tech jargon.
2. STRICT SKILL LIMIT (CRITICAL): If weaving in "AVAILABLE USER SKILLS", you are strictly forbidden from adding more than 2 new skills. NEVER list an entire tech stack (e.g., do not write "React, Next.js, Node.js, Express, Prisma"). Choose a maximum of 2 tools that fit the specific task perfectly.
3. THE FORMULA: [Strong Action Verb] + [Specific Task/Core Feature] + [Maximum 2 Technologies Used] + [Qualitative Technical Impact].
4. NO METRICS OR PLACEHOLDERS: Do NOT invent fake numbers, percentages, or revenue metrics. ABSOLUTELY DO NOT use placeholders like "[X]%". 
5. FOCUS ON ARCHITECTURAL VALUE: Define the impact using qualitative engineering benefits (e.g., "ensuring seamless real-time data synchronization", "improving system fault tolerance").
6. TONE: Authoritative, objective, and highly professional. Remove all fluff words, personal pronouns (I, we), and passive voice.

### REQUIRED VARIATIONS
- Variation 1 (Technical Depth): Focus heavily on the system architecture, tools, frameworks, and engineering complexity.
- Variation 2 (Impact & Value): Focus on the engineering outcome (e.g., scalability, maintainability, user experience) without using any numbers or percentages.
- Variation 3 (Concise & Direct): Short, punchy, and straight to the point without filler words.

### OUTPUT FORMAT
You must return a raw JSON object exactly matching this schema. NO markdown wrapping, NO conversational text.

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
        { role: "system", content: "You are a JSON-only resume optimization engine. Always return valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" } 
    })

    const raw = response.choices[0]?.message?.content || "{}"
    
    try {
        return JSON.parse(raw)
    } catch (parseError) {
        console.error("JSON Parse Error:", raw)
        return { error: "Failed to format the optimized bullet point. Please try again." }
    }

  } catch (err) {
    console.error("Optimizer AI Error:", err)
    throw new Error("Failed to optimize bullet")
  }
}