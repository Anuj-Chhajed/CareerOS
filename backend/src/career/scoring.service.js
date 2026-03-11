const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

exports.computeFitScoreAI = async (resumeData, benchmark) => {
  if (!benchmark || !benchmark.topSkills) throw new Error("Invalid benchmark data")

  // Prepare the context for the AI
  const candidateProfile = {
    skills: resumeData.skills || [],
    experience: resumeData.experience_years || 0,
    projects: (resumeData.projects || []).map(p => ({ title: p.title, tech: p.tech_stack })),
  }

  const marketRequirements = {
    role: benchmark.role,
    top_skills: benchmark.topSkills.map(s => `${s.skill} (${s.percentage}% importance)`),
    avg_experience: benchmark.avgExperience
  }

  const prompt = `
You are a Senior Technical Hiring Manager and a strict evaluation engine.

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON.
- Do NOT include markdown, explanations, or extra text.
- Do NOT invent skills, tools, or experience.
- Be conservative and fair in scoring.

TASK:
Evaluate the candidate for the role of "${marketRequirements.role}".
Assign a Fit Score (0–100) and identify ONLY truly critical missing skills.

INPUT DATA:
----------------
MARKET REQUIREMENTS:
- Role: ${marketRequirements.role}
- Critical Skills (with importance):
  ${JSON.stringify(marketRequirements.top_skills)}
- Average Required Experience: ${marketRequirements.avg_experience} years
----------------
CANDIDATE PROFILE:
- Skills: ${JSON.stringify(candidateProfile.skills)}
- Experience: ${candidateProfile.experience} years
- Projects: ${JSON.stringify(candidateProfile.projects)}
----------------

SCORING RULES (STRICTLY FOLLOW):

1. STACK EQUIVALENCY
- If the role is GENERIC (Backend / Full Stack):
  - Treat Java, Node.js, Python, and .NET backends as equivalent.
  - Do NOT heavily penalize stack differences.
  - Strong backend in another stack → score range 75–85.
- If the role is STACK-SPECIFIC, apply only moderate penalty.

2. IMPLICIT SKILLS
- Credit implicit knowledge:
  - MERN Stack → MongoDB, Express, React, Node.js
  - MEAN Stack → MongoDB, Express, Angular, Node.js
- Do NOT list implicit skills as missing.

3. EXPERIENCE HANDLING
- Freshers (0 years) with strong, relevant projects CAN score 80+.
- Experience mismatch should reduce score gradually.
- Never fail a candidate only due to low experience.

4. PROJECT EVALUATION
- Relevant, real-world projects significantly increase score.
- Tech relevance matters more than project count.

5. MISSING SKILLS (VERY IMPORTANT)
- MAXIMUM 6 items. MINIMUM 3 items (unless the score is above 90).
- List a skill ONLY IF:
  - It is critical to the role
  - AND it is clearly absent
  - AND it would block on-the-job performance
- ONLY list specific HARD TECHNICAL SKILLS (e.g., "Docker", "GraphQL", "Redis").
- ABSOLUTELY NO soft skills (e.g., "Communication", "Teamwork", "Leadership").
- ABSOLUTELY NO vague concepts (e.g., "System Design", "Testing", "APIs").
- If the score is low (< 70), you MUST find at least 4 hard technical skills they are missing compared to standard industry expectations for this role.
- Do NOT list optional or nice-to-have tools.

6. SCORE GUIDELINES
- Excellent match → 85–95
- Strong but different stack → 75–85
- Partial match → 60–75
- Weak match → below 60
- Avoid extreme scores unless clearly justified.

OUTPUT JSON (STRICT FORMAT):
{
  "finalScore": <number between 0 and 100>,
  "missingSkills": [
    {
      "skill": "<skill name>"
    }
  ]
}

If no critical skills are missing, return an empty "missingSkills" array.
`

  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b", // Use a smart model for reasoning
      messages: [
        { role: "system", content: "You are a fair JSON-only scoring engine." },
        { role: "user", content: prompt }
      ],
      temperature: 0
    })

    const raw = response.choices[0]?.message?.content || "{}"
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
        // Fallback if AI fails: Basic Math
        return { finalScore: 50, missingSkills: [], reason: "AI Scoring unavailable" }
    }

    const aiResult = JSON.parse(jsonMatch[0]);

    return {
      finalScore: aiResult.finalScore,
      missingSkills: aiResult.missingSkills || [],
      skillScore: aiResult.finalScore,
      expScore: aiResult.finalScore
    };

  } catch (err) {
    console.error("AI Scoring Failed:", err)
    return { finalScore: 0, missingSkills: [] }
  }
}