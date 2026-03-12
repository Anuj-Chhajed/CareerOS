const Groq = require("groq-sdk")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
exports.extractStructuredData = async (text, type) => {
  const safeText = text.slice(0, 25000)
  const prompt = `
  You are an Expert Resume Parser with "Smart Aggregation" capabilities.
  
  OBJECTIVE:
  Extract structured data from the resume. 
  
  CRITICAL SKILL EXTRACTION RULE:
  - Do NOT limit yourself to the "Skills" section.
  - SCAN the "Projects", "Work Experience", and "Summary" sections.
  - If a specific tool, language, or framework is mentioned in a sentence (e.g., "Built a backend using Node.js"), YOU MUST ADD "Node.js" to the global "skills" array.
  - Do NOT duplicate skills (e.g. if "React" is in Skills and Projects, list it once).
  
  ====================
  FIELD INSTRUCTIONS
  ====================
  
  1. SKILLS (Array):
     - Aggregated list of ALL technologies found in the document.
     - Extract programming languages, frameworks, libraries, databases,
       cloud platforms, DevOps tools, and major software technologies.
     - Exclude soft skills (Leadership, Communication, Teamwork).
     - Exclude job roles (Developer, Engineer).
     - Exclude methodologies unless explicitly a tool (e.g., Agile is excluded).
     - If mentioned multiple times, include only once.
     - Normalize common variations:
       - ReactJS → React
       - NodeJS → Node.js
       - Postgres → PostgreSQL
       - JS → JavaScript
       - REST API / Rest API / RestAPI / RESTful APIs → REST APIs

     Scan ALL sections:
      - Skills
      - Work Experience
      - Projects
      - Summary

  2. EXPERIENCE_YEARS (Number):
     - Priority 1: Extract explicit text (e.g., "5+ years experience").
     - Priority 2: If NOT explicit, CALCULATE the sum of durations from the "Work Experience" dates.
     - Round to the nearest 0.5 year.
     - Return 0 if no dates found.
  
  3. EDUCATION (String):
     - Extract the highest degree and university.
     - Format: "Degree - University" (e.g., "BS Computer Science - MIT").
     - If null, return "Not specified".
  
  4. PROJECTS (Array):
     - Extract title and tech stack for each project.
     - If tech stack is not explicitly listed, infer it from the project description text.
  
  ====================
  OUTPUT FORMAT (JSON ONLY)
  ====================
  {
    "skills": ["Tech1", "Tech2", ...],
    "experience_years": 2.5,
    "education": "String",
    "projects": [
      {
        "title": "Project Name",
        "tech_stack": ["Tech1", "Tech2"]
      }
    ]
  }
  
  INPUT TEXT:
  """
  ${safeText}
  """
  `

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a deterministic parser for resumes." },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      max_completion_tokens: 3000
    })

    const raw = response.choices[0]?.message?.content?.trim()

    const jsonMatch = raw.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error("No JSON found:", raw)
      throw new Error("AI returned non-JSON output")
    }

    try {
      const data = JSON.parse(jsonMatch[0])

      data.skills ??= []
      data.projects ??= []
      data.experience_years ??= null
      data.education ??= "Not specified"

      return data;
    } catch (err) {
      console.error("Invalid JSON:", raw)
      throw new Error("AI JSON parse failed")
    }
  } catch (err) {
    console.error("JSON PARSE ERROR:", err)
    throw new Error("AI returned invalid JSON")
  }
    }