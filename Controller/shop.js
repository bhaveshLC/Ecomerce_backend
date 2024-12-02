const Customer = require("../model/customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("../model/product");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
async function handleGetHomeProducts(req, res) {
  const { name, sortBy, limit = 10, page = 1 } = req.query;
  const itemsPerPage = parseInt(limit, 10);
  const currentPage = parseInt(page, 10);

  const filterQuery = {};
  if (name) {
    filterQuery.name = { $regex: name, $options: "i" };
  }

  let sortQuery = {};
  if (sortBy) {
    sortQuery[sortBy] = 1;
  }

  const products = await Product.find(filterQuery)
    .sort(sortQuery)
    .skip((currentPage - 1) * itemsPerPage)
    .limit(itemsPerPage);

  const totalProducts = await Product.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  return res.status(200).json({
    products,
    totalProducts,
    totalPages: totalPages,
    page: currentPage,
    limit: itemsPerPage,
  });
}
async function handleCustomerRegister(req, res) {
  const { email, password, name, address } = req.body;
  const user = await Customer.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "User Already Exists." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await Customer.create({
    email: email,
    password: hashedPassword,
    name: name,
    address: address,
    picture: process.env.DEFAULT_PROFILE_PICTURE,
  });
  res.status(200).json({ message: "User Created." });
}
async function handleCustomerLogin(req, res) {
  const { email, password } = req.body;
  const user = await Customer.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No User Found." });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Password does not match..." });
  }
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    secretKey,
    { expiresIn: "2d" }
  );
  const expirationDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const { password: userPassword, ...userWithoutPassword } = user.toObject();
  res
    .status(200)
    .json({ user: userWithoutPassword, token: token, expires: expirationDate });
}
async function handleCustomerSelfInfo(req, res) {
  const { password: userPassword, ...userWithoutPassword } =
    req.user.toObject();
  return res.status(200).json(userWithoutPassword);
}
module.exports = {
  handleGetHomeProducts,
  handleCustomerRegister,
  handleCustomerLogin,
  handleCustomerSelfInfo,
};
