const { parsePDF } = require("./pdf.service")

exports.handlePDFParse = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file required" })
    }

    const result = await parsePDF(req.file.buffer)
    res.json(result)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "PDF parsing failed" })
  }
}