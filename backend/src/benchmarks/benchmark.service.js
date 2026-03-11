const RoleBenchmark = require("./benchmark.model")
const { runMarketAnalysis } = require("./market.utils")

const BATCH_SIZE = 10; // We fetch 10 JDs at a time

/**
 * Helper: Merges old stats with new batch stats using Weighted Average.
 */
function mergeBenchmarkData(oldData, newData) {
  const oldN = oldData.sampleSize || 0
  const newN = BATCH_SIZE
  const totalN = oldN + newN

  // 1. Merge Skills (Weighted Average)
  const skillMap = new Map()

  // Add Old Skills first (Weighted by oldN)
  if (oldData.topSkills) {
    oldData.topSkills.forEach(s => {
      skillMap.set(s.skill.toLowerCase(), { 
        name: s.skill, 
        weightedSum: s.percentage * oldN 
      })
    })
  }

  // Add New Skills (Weighted by newN)
  if (newData.topSkills) {
    newData.topSkills.forEach(s => {
      const key = s.skill.toLowerCase()
      const existing = skillMap.get(key) || { name: s.skill, weightedSum: 0 }
      
      // Add the new score contribution
      existing.weightedSum += (s.percentage * newN)
      skillMap.set(key, existing)
    })
  }

  // Convert Map back to Array and calculate final average
  const mergedSkills = Array.from(skillMap.values()).map(item => ({
    skill: item.name,
    percentage: Math.round(item.weightedSum / totalN) 
  })).sort((a, b) => b.percentage - a.percentage)

  // 2. Merge Avg Experience
  const oldExp = oldData.avgExperience || 0
  const newExp = newData.avgExperience || 0
  const mergedExp = ((oldExp * oldN) + (newExp * newN)) / totalN

  // 3. Merge Soft Skills (Union of unique values)
  const softSkillSet = new Set([...(oldData.topSoftSkills || []), ...(newData.topSoftSkills || [])])
  const mergedSoftSkills = Array.from(softSkillSet).slice(0, 10)

  return {
    topSkills: mergedSkills,
    avgExperience: Number(mergedExp.toFixed(1)),
    topSoftSkills: mergedSoftSkills,
    sampleSize: totalN
  }
}

exports.getBenchmarkForRole = async (role) => {
  const normalizedRole = role.toLowerCase()
  
  // 1. Check DB
  let benchmark = await RoleBenchmark.findOne({ role: normalizedRole })

  // 2. Check Conditions: Missing? Stale (>7 days)? Empty?
  const isStale = benchmark && (new Date() - benchmark.lastUpdated > 7 * 24 * 60 * 60 * 1000)
  const isEmpty = benchmark && (!benchmark.topSkills || benchmark.topSkills.length === 0)

  if (!benchmark || isStale || isEmpty) {
    console.log(`🔄 Refreshing market data for: ${normalizedRole}`)
    
    // 3. Run Pipeline (Fetch + Analyze)
    const insights = await runMarketAnalysis(normalizedRole)
    
    if (insights) {
      if (benchmark) {
        // --- CASE A: UPDATE EXISTING (Accumulate) ---
        console.log(`📈 Accumulating new data into existing benchmark (N=${benchmark.sampleSize})...`)
        
        // HERE IS THE FIX: We use the merge function instead of overwriting
        const mergedData = mergeBenchmarkData(benchmark, insights)
        
        benchmark = await RoleBenchmark.findOneAndUpdate(
          { role: normalizedRole },
          { 
            ...mergedData,
            lastUpdated: new Date()
          },
          { new: true }
        )
      } else {
        // --- CASE B: CREATE NEW (First Run) ---
        console.log("🆕 Creating new benchmark...")
        
        benchmark = await RoleBenchmark.create({
          role: normalizedRole,
          topSkills: insights.topSkills || [],
          topSoftSkills: insights.topSoftSkills || [],
          avgExperience: insights.avgExperience || 0,
          sampleSize: BATCH_SIZE,
          lastUpdated: new Date()
        })
      }
      console.log(`✅ Benchmark updated! New Sample Size: ${benchmark.sampleSize}`)
    }
  }

  return benchmark
}