const { getBenchmarkForRole } = require("./benchmark.service")

exports.getBenchmark = async (req, res) => {
  try {
    const { role } = req.body
    console.log("📩 Benchmark request for:", role)
    const data = await getBenchmarkForRole(role)

    if (!data) {
      console.log("⏳ Benchmark generation triggered")
      return res.status(202).json({ message: "Benchmark is being generated. Please try again in 5 seconds." })
    }
    console.log("✅ Returning cached benchmark")
    res.json(data)

  } catch (err) {
    console.error("Controller error:", err)
    res.status(500).json({ error: "Server error" })
  }
}