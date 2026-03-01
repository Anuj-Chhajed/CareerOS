const express = require("express")
const router = express.Router()
const { analyzeResume } = require("./analysis.controller")

router.post("/extract", analyzeResume)

module.exports = router