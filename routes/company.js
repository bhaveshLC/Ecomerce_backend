const express = require("express");
const {
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
} = require("../Controller/company");
const { authenticateToken } = require("../middleware/authenticateToken");
// const passport = require("passport");
// require("../config/passport");
const router = express.Router();

router.post("/auth/register", handleCompanyRegister);
router.post("/auth/login", handleCompanyLogin);
router.get("/auth/self", authenticateToken, handleSelfInfo);
router.patch("/users/org", authenticateToken, handleCompanyInfoUpdate);
router.get("/users", authenticateToken, handleGetAllUsers);
router.post("/users", authenticateToken, handleCreateUser);
router.patch("/users/:userId", authenticateToken, handleUpdateUser);
router.patch("/users/role/:userId", authenticateToken, handleUpdateUserRole);
router.delete("/users/:userId", authenticateToken, handleDeleteUser);
router.post("/auth/change-password", authenticateToken, handleChangePassword);
router.post("/auth/forgot-password", handleForgotPassword);
router.post("/auth/reset-password", handleResetPassword);
router.post("/auth/send-verification-email", handleSendVerification);
router.post("/auth/verify-email", authenticateToken, handleVerifyEmail);

// router.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login-failed" }),
//   (req, res) => {
//     res.redirect("/home");
//   }
// );

// router.get("/home", (req, res) => {
//   res.json({ message: "Login Successful through Google." });
// });

// router.get("/login-failed", (req, res) => {
//   res.json({ message: "Google Login Failed." });
// });

module.exports = { companyRouter: router };
