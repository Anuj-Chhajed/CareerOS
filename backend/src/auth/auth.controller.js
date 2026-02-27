const { registerUser, loginUser } = require("./auth.service")

const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token
    })
  } catch (error) {
    console.error("Register Error:", error)
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body)
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token
    })

  } catch (error) {
    console.error("Login Error:", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error)
  }
}
module.exports = {register, login}