const express = require("express")
const router = express.Router()
const { getFitScore, getAnalysisById, getAnalysisHistory } = require("./career.controller")
const { verifyToken } = require("../auth/auth.middleware")

router.post("/score", verifyToken, getFitScore)
router.get("/history", verifyToken, getAnalysisHistory)
router.get("/analysis/:id", verifyToken, getAnalysisById)

module.exports = router