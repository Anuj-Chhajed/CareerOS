const express = require("express")
const router = express.Router()
const { getRoadmap, getAllRoadmaps, getRoadmapById } = require("./roadmap.controller")
const { verifyToken } = require("../auth/auth.middleware")

router.post("/generate", verifyToken, getRoadmap)
router.get("/", verifyToken, getAllRoadmaps)
router.get("/:id", verifyToken, getRoadmapById)

module.exports = router