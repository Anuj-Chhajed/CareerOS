const express = require("express")
const router = express.Router()
const { getBenchmark } = require("./benchmark.controller")
const { verifyToken } = require("../auth/auth.middleware")

router.post("/benchmark", verifyToken, getBenchmark)

module.exports = router