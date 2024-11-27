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
} = require("../controller/company");
const router = express.Router();
router.post("/auth/register", handleCompanyRegister);
router.post("/auth/login", handleCompanyLogin);
router.get("/auth/self", handleSelfInfo);
router.patch("/users/org", handleCompanyInfoUpdate);
router.get("/users", handleGetAllUsers);
router.post("/users", handleCreateUser);
router.patch("/users/:userId", handleUpdateUser);
router.patch("/users/role/:userId", handleUpdateUserRole);
router.delete("/users/:userId", handleDeleteUser);
module.exports = { companyRouter: router };
