const jwt = require("jsonwebtoken");
const Customer = require("../model/customer");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

async function customerTokenAuth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(400).json({ message: "Token is requied..." });
  }
  const tokenData = token.split(" ");
  if (tokenData.length !== 2 && tokenData[0] !== "Bearer") {
    return res
      .status(400)
      .json({ message: "Invalid Token Format, Use  Bearer Token" });
  }
  try {
    const decode = await jwt.verify(tokenData[1], secretKey);
    if (!decode) {
      return res
        .status(401)
        .json({ message: "Invalid token. Please authenticate." });
    }
    const user = await Customer.findById(decode._id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User Not Found, Please Authenticate..." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error during token verification:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}
module.exports = { customerTokenAuth };
