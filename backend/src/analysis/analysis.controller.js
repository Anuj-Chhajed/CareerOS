const { extractStructuredData } = require("./ai.service")

exports.analyzeResume = async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: "Resume text required" })
    }

    const structured = await extractStructuredData(text, "resume")

    res.json(structured)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}