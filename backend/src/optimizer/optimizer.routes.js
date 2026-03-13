const express = require("express")
const router = express.Router()
const { optimizeBullet } = require("./optimizer.controller")
const { verifyToken } = require("../auth/auth.middleware")

router.post("/optimize", verifyToken, optimizeBullet)

module.exports = router