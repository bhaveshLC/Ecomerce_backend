const { User, org } = require("../models/company");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "$Bhavesh#321";
async function handleCompanyRegister(req, res) {
  const { email, password, name, companyName } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.status(404).json({ message: "User already exists." });
  }
  const hashedPassword = await bcrypt.hash(password, 10); // password, saltRound
  orgData = await org.create({
    name: companyName,
    email: email,
  });

  await User.create({
    name: name,
    email: email,
    password: hashedPassword,
    _org: orgData,
    isEmailVerified: false,
    role: "admin",
    deleted: false,
  });

  return res.status(201).json({ message: "User Created Successfully" });
}

async function handleCompanyLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No User Found." });
  }
  console.log(user.password);
  if (!user) {
    return res.status(404).json({ message: "User Not Found." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid Password" });
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

  return res
    .status(200)
    .json({ user: userWithoutPassword, token: token, expires: expirationDate });
}
async function handleSelfInfo(req, res) {
  const bearerToken = req.headers["authorization"];
  const token = bearerToken.split("Bearer ")[1];
  const email = JSON.parse(atob(token.split(".")[1])).email;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Please Authenticate." });
  }
  const { password: userPassword, ...userWithoutPassword } = user.toObject();
  return res.status(200).json(userWithoutPassword);
}
async function handleCompanyInfoUpdate(req, res) {
  const { email, name } = req.body;
  const bearerToken = req.headers["authorization"];
  const token = bearerToken.split("Bearer ")[1];
  if (token) {
  }
  const userId = JSON.parse(atob(token.split(".")[1]))._id;
  const user = await User.findById(userId);
  const updatedOrg = await org.findByIdAndUpdate(
    { _id: user._org._id },
    { name, email },
    { new: true }
  );
  user._org.name = updatedOrg.name;
  user._org.email = updatedOrg.email;
  await user.save();
  if (!updatedOrg) {
    return res.status(404).json({ message: "Organization is not found." });
  }
  return res.status(200).json(updatedOrg);
}

async function handleGetAllUsers(req, res) {
  const token = req.headers["authorization"];
  const userId = JSON.parse(atob(token.split(".")[1]))._id;
  const user = await User.findById(userId);
  const userList = await User.find({ "_org._id": user._org._id });
  const result = userList.map((user) => {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  });
  return res.status(200).json({ result });
}

async function handleCreateUser(req, res) {
  const { email, password, name, role } = req.body;
  const token = req.headers["authorization"];
  const userId = JSON.parse(atob(token.split(".")[1]))._id;
  const user = await User.findById(userId);
  console.log(user);
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: name,
    email: email,
    password: hashedPassword,
    _org: user._org,
    isEmailVerified: false,
    role: "admin",
    deleted: false,
  });
  return res.json({ message: "User created Successfully." });
}

async function handleUpdateUser(req, res) {
  const userId = req.params.userId;
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let user = await User.findById({ _id: userId });
  user.email = email;
  user.password = hashedPassword;
  user.name = name;
  console.log(user);
  await user.save();
  const { password: userPassword, ...userWithoutPassword } = user.toObject();
  return res.json(userWithoutPassword);
}
async function handleUpdateUserRole(req, res) {
  const role = req.body;
  console.log(role);
  const userId = req.params.userId;
  let user = await User.findById({ _id: userId });
  if (!user) {
    return res.json({ message: "No user found." });
  }
  console.log(user);
  user.role = role.role;

  await user.save();
  return res.json({ message: "User Role Updated." });
}
async function handleDeleteUser(req, res) {
  const userId = req.params.userId;
  const user = await User.findByIdAndDelete({ _id: userId });
  if (!user) {
    return res.json({ message: "No User Found." });
  }
  return res.json({ message: "User Deleted Successfully." });
}
async function handleChangePassword(req, res) {}
module.exports = {
  handleCompanyRegister,
  handleCompanyLogin,
  handleSelfInfo,
  handleCompanyInfoUpdate,
  handleGetAllUsers,
  handleCreateUser,
  handleUpdateUser,
  handleUpdateUserRole,
  handleDeleteUser,
};
