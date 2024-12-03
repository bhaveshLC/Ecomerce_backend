const express = require("express");
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  handleSellerOrderHistory,
  handleSellerOrderDetails,
  handleOrderActions,
} = require("../Controller/order");
const router = express.Router();
router.get("/", authenticateToken, handleSellerOrderHistory);
router.get("/:orderId", authenticateToken, handleSellerOrderDetails);
router.patch("/:action/:orderId", authenticateToken, handleOrderActions);
module.exports = { orderRoute: router };
