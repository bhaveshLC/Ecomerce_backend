const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const {
  handleCreateProduct,
  handleGetAllProducts,
  handleGetProduct,
  handleUpdateProduct,
  handleUpdateProductImages,
  handleDeleteProduct,
} = require("../Controller/product");
const { authenticateToken } = require("../middleware/authenticateToken");

const uploadDir = path.join(__dirname, "../upload/products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    callback(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({ storage });
router.post(
  "/",
  authenticateToken,
  upload.array("images"),
  handleCreateProduct
);
router.get("/", authenticateToken, handleGetAllProducts);
router.get("/:productId", authenticateToken, handleGetProduct);
router.patch("/:productId", authenticateToken, handleUpdateProduct);
router.patch(
  "/images/:productId",
  authenticateToken,
  upload.array("images"),
  handleUpdateProductImages
);
router.delete("/:productId", authenticateToken, handleDeleteProduct);
module.exports = { productsRoute: router };
