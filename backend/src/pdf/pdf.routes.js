const express = require("express")
const router = express.Router()
const upload = require("../middlewares/upload.middleware")
const { verifyToken } = require("../auth/auth.middleware")
const { handlePDFParse } = require("./pdf.controller")

router.post("/parse", verifyToken, upload.single("pdf"), handlePDFParse)

module.exports = router