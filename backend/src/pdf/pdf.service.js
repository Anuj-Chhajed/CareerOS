const { PDFParse } = require('pdf-parse')
const { cleanText } = require("../utils/textCleaner")

exports.parsePDF = async (buffer) => {
  const parser = new PDFParse({ data: buffer })
  const textResult = await parser.getText()
  const infoResult = await parser.getInfo()
  await parser.destroy()
  const cleanedText = cleanText(textResult.text)

  return {
    text: cleanedText,
    pages: infoResult.total
  }
}