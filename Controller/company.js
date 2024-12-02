const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { User, org } = require("../model/company");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
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
  // console.log("from login");
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No User Found." });
  }
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
  await user.save();
  const { password: userPassword, ...userWithoutPassword } = user.toObject();
  return res.json(userWithoutPassword);
}
async function handleUpdateUserRole(req, res) {
  const role = req.body;
  const userId = req.params.userId;
  let user = await User.findById({ _id: userId });
  if (!user) {
    return res.json({ message: "No user found." });
  }
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
async function handleChangePassword(req, res) {
  const { old_password, new_password } = req.body;
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(400).json({ message: "Please authenticate." });
  }
  const userId = JSON.parse(atob(token.split(".")[1]))._id;
  const user = await User.findById({ _id: userId });

  const isPasswordValid = await bcrypt.compare(old_password, user.password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ status: 400, message: "Old password does not match..." });
  }
  const newHashedPassword = await bcrypt.hash(new_password, 10);
  user.password = newHashedPassword;
  await user.save();
  return res.status(200).json({ message: "Password Changed Successfully" });
}
async function handleForgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is Required..." });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found with this email." });
  }
  const token = jwt.sign({ _id: user._id, type: "resetPassword" }, secretKey, {
    expiresIn: "2h",
  });
  const currentPort = req.connection.localPort;
  const response = await axios.post(
    `http://localhost:8081/emails/${email}`,
    {
      subject: "Password Reset Request",
      text: `Please follow the link to reset your password.\n
          http://localhost:${currentPort}/auth/reset-password?token=${token}`,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.status(200).json({
    message: "Password reset email sent successfully",
    data: response.data,
  });
}
async function handleResetPassword(req, res) {
  const token = req.query.token;
  // console.log(token);
  const { password } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Please authenticate." });
  }
  const decode = JSON.parse(atob(token.split(".")[1]));
  const userId = decode._id;
  if (decode.type != "resetPassword") {
    return res.json({ message: "Provide Valid Token." });
  }
  const user = await User.findById({ _id: userId });
  if (!user) {
    return res.status(404).json({ message: "No User Found." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();
  return res.status(200).json({ message: "Password Reset Successfully." });
}
async function handleSendVerification(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is Required..." });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found with this email." });
  }
  const token = jwt.sign({ _id: user._id, type: "verifyEmail" }, secretKey, {
    expiresIn: "2h",
  });
  const currentPort = req.connection.localPort;
  const response = await axios.post(
    `http://localhost:8081/emails/${email}`,
    {
      subject: "Email Verification Request",
      text: `Please Click on the link to verify your account.\n
          http://localhost:${currentPort}/auth/verify-email?token=${token}`,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.status(200).json({
    message: "Password reset email sent successfully",
    data: response.data,
  });
}
async function handleVerifyEmail(req, res) {
  const token = req.query.token;
  const { password } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Please authenticate." });
  }
  const decode = JSON.parse(atob(token.split(".")[1]));
  const userId = decode._id;
  if (decode.type != "verifyEmail") {
    return res.json({ message: "Provide Valid Token." });
  }
  const user = await User.findById({ _id: userId });
  if (!user) {
    return res.status(404).json({ message: "No User Found." });
  }
  user.isEmailVerified = true;
  await user.save();
  return res.status(200).json({ message: "Email Verified Successfully." });
}

async function handleGoogleLogin(req, res) {}
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
  handleChangePassword,
  handleForgotPassword,
  handleResetPassword,
  handleSendVerification,
  handleVerifyEmail,
};
