const axios = require("axios")
const Groq = require("groq-sdk")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const fetchJDs = async (role) => {
  try {
    const options = {
      method: "GET",
      url: "https://jsearch.p.rapidapi.com/search",
      params: { query: `${role} India`, page: "1", num_pages: "1" },
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    }
    const response = await axios.request(options)
    return response.data.data.slice(0, 10).map(j => j.job_description)
  } catch (err) {
    console.error("JSearch Error:", err.message)
    return []
  }
}

// Sanitizer
const cleanBatch = (jdArray) => {
  return jdArray.map((text, i) => {
    return `JD ${i + 1}: ` + text
      .replace(/https?:\/\/\S+/g, "") // Remove Links
      .replace(/[^\w\s.,]/g, " ")    // Remove weird symbols
      .replace(/\s+/g, " ")          // Collapse spaces
      .slice(0, 1500)               // Truncate to save tokens
  }).join("\n\n")
}

const analyzeMarket = async (role, text) => {
  const prompt = `
  You are a Principal Career Strategist analyzing the 2026 job market for: "${role}".
  
  CONTEXT:
  I have provided a snapshot of 10 recent Job Descriptions (JDs). 
  However, this sample size is small and may be biased (e.g., it might accidentally miss core skills).

  YOUR TASK:
  Generate a "Hybrid Market Benchmark" by combining:
  1. The **Observed Frequency** from the provided text (What companies are asking for TODAY).
  2. Your **General Domain Knowledge** (What is standard in the industry).

  SCORING RULES:
  - If a skill appears in the JDs, score it based on frequency.
  - **CRITICAL BIAS CORRECTION:** If a universally standard skill for "${role}" (e.g., React for Frontend, Java for Backend) is missing or low in the JDs, **OVERRIDE** the low score with a realistic industry standard (e.g., set it to 80-90%).
  - Mark these corrected skills as "Core Standard".

  OUTPUT SCHEMA (Valid JSON Only):
  {
    "topSkills": [
      { "skill": "React", "percentage": 90 }, // Corrected based on expert knowledge
      { "skill": "TypeScript", "percentage": 65 } // Observed in text
    ],
    "topSoftSkills": ["..."],
    "avgExperience": 2.5
  }

  DATA SNAPSHOT:
  """
  ${text}
  """
  `

  try {
    const res = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        { role: "system", content: "You are a data analyst. Output valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1
    })

    const raw = res.choices[0]?.message?.content || ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch (err) {
    console.error("AI Analysis Error:", err.message)
    return null
  }
}

exports.runMarketAnalysis = async (role) => {
  console.log(`🚀 Analyzing market for: ${role}...`)
  const jds = await fetchJDs(role)
  if (!jds.length) return null
  
  const cleanedText = cleanBatch(jds)
  const insights = await analyzeMarket(role, cleanedText)
  
  return insights
}