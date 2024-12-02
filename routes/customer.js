const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  handleUpdateCustomer,
  handleUpdateCustomerPicture,
  handleRemoveCustomerPicture,
  handleGetSavedAddress,
  handleAddAddress,
  handleUpdateAddress,
  handleDeleteAddress,
  handleChangePassword,
  handleDeleteAccount,
} = require("../Controller/customer");
const uploadDir = path.join(__dirname, "../upload/customer");

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
const { customerTokenAuth } = require("../middleware/customerTokenAuth");
const router = express.Router();
router.patch("/update-profile", customerTokenAuth, handleUpdateCustomer);
router.post(
  "/profile-picture",
  customerTokenAuth,
  upload.single("images"),
  handleUpdateCustomerPicture
);
router.delete(
  "/profile-picture",
  customerTokenAuth,
  handleRemoveCustomerPicture
);
router.get("/address", customerTokenAuth, handleGetSavedAddress);
router.post("/address", customerTokenAuth, handleAddAddress);
router.put("/address/:addressId", customerTokenAuth, handleUpdateAddress);
router.delete("/address/:addressId", customerTokenAuth, handleDeleteAddress);
router.post("/auth/change-password", customerTokenAuth, handleChangePassword);
router.delete("/account", customerTokenAuth, handleDeleteAccount);
module.exports = { customerRouter: router };
