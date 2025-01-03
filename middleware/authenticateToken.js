const jwt = require("jsonwebtoken");
const { User } = require("../model/company");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

async function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  const tokenData = token.split(" ");
  if (tokenData.length !== 2 || tokenData[0] !== "Bearer") {
    return res
      .status(400)
      .json({ message: "Invalid token format. Use Bearer token." });
  }

  try {
    const decoded = jwt.verify(tokenData[1], secretKey);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Invalid token. Please authenticate." });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found, please authenticate." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error during token verification:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

module.exports = { authenticateToken };
