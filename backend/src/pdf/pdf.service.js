const { PDFParse } = require('pdf-parse')

const cleanText = (text) => {
  return text
    .replace(/--\s*\d+\s*of\s*\d+\s*--/g, " ")
    .replace(/\s+/g, " ")
    .replace(/●/g, " ")
    .trim()
}

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