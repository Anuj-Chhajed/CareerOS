const express = require("express")
const router = express.Router()
const upload = require("../middlewares/upload.middleware")
const { handlePDFParse } = require("./pdf.controller")

router.post("/parse", upload.single("pdf"), handlePDFParse)

module.exports = router