const express = require("express");
const {
  handleCustomerRegister,
  handleCustomerLogin,
  handleGetHomeProducts,
  handleCustomerSelfInfo,
} = require("../Controller/shop");
const { customerTokenAuth } = require("../middleware/customerTokenAuth");
const {
  handleCreateOrder,
  handleConfirmOrder,
  handleOrderHistory,
  handleOrderDetails,
  handleCancelOrder,
} = require("../Controller/order");
const router = express.Router();
router.get("/products", handleGetHomeProducts);
router.post("/auth/register", handleCustomerRegister);
router.post("/auth/login", handleCustomerLogin);
router.get("/auth/self", customerTokenAuth, handleCustomerSelfInfo);
router.post("/orders", customerTokenAuth, handleCreateOrder);
router.put("/orders/confirm/:orderId", customerTokenAuth, handleConfirmOrder);
router.get("/orders", customerTokenAuth, handleOrderHistory);
router.get("/orders/:orderId", customerTokenAuth, handleOrderDetails);
router.patch("/orders/cancel/:orderId", customerTokenAuth, handleCancelOrder);
module.exports = { shopRoute: router };
