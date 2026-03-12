const express = require("express")
const router = express.Router()
const { analyzeResume } = require("./analysis.controller")
const { verifyToken } = require("../auth/auth.middleware")

router.post("/extract", verifyToken, analyzeResume)

module.exports = router