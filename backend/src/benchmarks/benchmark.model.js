const mongoose = require("mongoose")

const roleBenchmarkSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  sampleSize: { type: Number, default: 0 }, 
  topSkills: [
    {
      skill: String,
      percentage: Number
    }
  ],
  topSoftSkills: [String],
  avgExperience: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("RoleBenchmark", roleBenchmarkSchema)