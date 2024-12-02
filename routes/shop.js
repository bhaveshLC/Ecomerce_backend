const express = require("express");
const {
  handleCustomerRegister,
  handleCustomerLogin,
  handleGetHomeProducts,
  handleCustomerSelfInfo,
} = require("../Controller/shop");
const { customerTokenAuth } = require("../middleware/customerTokenAuth");
const router = express.Router();
router.get("/products", handleGetHomeProducts);
router.post("/auth/register", handleCustomerRegister);
router.post("/auth/login", handleCustomerLogin);
router.get("/auth/self", customerTokenAuth, handleCustomerSelfInfo);
module.exports = { shopRoute: router };
