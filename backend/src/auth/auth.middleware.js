const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided or invalid format" })
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(403).json({ msg: "Invalid or expired token" })
  }
}

module.exports = {verifyToken}