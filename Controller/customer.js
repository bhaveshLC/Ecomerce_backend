const Customer = require("../model/customer");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt");
require("dotenv").config();

cloudinary.config({
  cloud_name: "dypziffc0",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function handleUpdateCustomer(req, res) {
  const { name, email } = req.body;
  const user = req.user;
  user.name = name;
  user.email = email;
  await user.save();
  return res.status(200).json({ message: "User Profile Updated." });
}
async function handleUpdateCustomerPicture(req, res) {
  let imageUrls = "";
  const file = req.file;
  const user = req.user;
  if (!file) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  const uploadResult = await cloudinary.uploader.upload(file.path);
  const optimizeUrl = cloudinary.url(uploadResult.public_id, {
    fetch_format: "auto",
    quality: "auto",
  });
  imageUrls = optimizeUrl;
  console.log(imageUrls);

  user.picture = imageUrls;
  await user.save();
  return res.json("User Profile Picture Updated.");
}
async function handleRemoveCustomerPicture(req, res) {
  const user = req.user;
  user.picture = process.env.DEFAULT_PROFILE_PICTURE;

  await user.save();
  return res.status(200).json({ message: "User Profile Picture Deleted." });
}
async function handleGetSavedAddress(req, res) {
  return res.json({ address: req.user.address });
}
async function handleAddAddress(req, res) {
  const { street, addressLine2, city, state, pin } = req.body;
  const user = req.user;
  user.address.push({
    street: street,
    addressLine2: addressLine2,
    city: city,
    state: state,
    pin: pin,
  });
  await user.save();
  return res.json({ address: user.address });
}
async function handleUpdateAddress(req, res) {
  const { street, addressLine2, city, state, pin } = req.body;
  const user = req.user;
  const addressId = req.params.addressId;
  const addressIdx = user.address.findIndex(
    (address) => address._id == addressId
  );
  user.address[addressIdx] = {
    ...user.address[addressIdx],
    street: street,
    addressLine2: addressLine2,
    city: city,
    state: state,
    pin: pin,
  };
  await user.save();
  return res.json(user.address);
}
async function handleDeleteAddress(req, res) {
  const user = req.user;
  const addressId = req.params.addressId;
  const address = user.address.filter(
    (address) => address._id.toString() !== addressId
  );
  if (address.length == user.address.length) {
    return res.status(404).json({ message: "Address Not Found..." });
  }
  user.address = address;
  await user.save();
  return res.status(200).json({ message: "address Deleted Successfully." });
}
async function handleChangePassword(req, res) {
  const { old_password, new_password } = req.body;
  const user = req.user;
  console.log(old_password);

  const isPasswordValid = await bcrypt.compare(old_password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Old password does not match..." });
  }
  const hashedPassword = await bcrypt.hash(new_password, 10);
  user.password = hashedPassword;
  await user.save();
  return res.status(200).json({ message: "Password change successfully." });
}
async function handleDeleteAccount(req, res) {
  const user = req.user;
  const isUserDeleted = await Customer.findByIdAndDelete({ _id: user._id });
  if (!isUserDeleted) {
    return res.status(404).json({ message: "No User Found..." });
  }
  return res.status(200).json({ message: "User Deleted SUccessfully." });
}
module.exports = {
  handleUpdateCustomer,
  handleUpdateCustomerPicture,
  handleRemoveCustomerPicture,
  handleGetSavedAddress,
  handleAddAddress,
  handleUpdateAddress,
  handleDeleteAddress,
  handleChangePassword,
  handleDeleteAccount,
};
