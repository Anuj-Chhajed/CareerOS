const mongoose = require("mongoose")

const RoadmapSchema = new mongoose.Schema({
  // Link roadmap to the user
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  role: { type: String, required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: "ResumeAnalysis", required: true },
  roadmap: [
    {
      week: Number,
      theme: String,
      skills: [
        {
          name: String,
          reason: String,
          searchQuery: String,
          isCompleted: { type: Boolean, default: false }
        }
      ]
    }
  ],
  estimatedWeeks: Number,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Roadmap", RoadmapSchema)