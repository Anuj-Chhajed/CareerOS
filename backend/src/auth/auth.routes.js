const express = require("express")
const { register, login } = require("./auth.controller")
const { verifyToken } = require("./auth.middleware")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Profile accessed", user: req.user })
});

module.exports = router