const Product = require("../model/product");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
// Cloudinary Configuration
cloudinary.config({
  cloud_name: "dypziffc0",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function handleCreateProduct(req, res) {
  try {
    const { name, description, price } = req.body;
    const imageUrls = [];
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    for (const file of req.files) {
      const uploadResult = await cloudinary.uploader.upload(file.path);
      const optimizeUrl = cloudinary.url(uploadResult.public_id, {
        fetch_format: "auto",
        quality: "auto",
      });
      imageUrls.push({
        public_id: uploadResult.public_id,
        url: optimizeUrl,
      });
    }
    const newProduct = new Product({
      _org: req.user._org._id,
      name,
      description,
      price,
      images: imageUrls,
    });
    await newProduct.save();
    return res.status(201).json({
      message: "Product created successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
async function handleGetAllProducts(req, res) {
  const user = req.user;
  const { name, sortBy, limit = 10, page = 1 } = req.query;
  const itemsPerPage = parseInt(limit, 10);
  const currentPage = parseInt(page, 10);
  let filterQuery = { _org: user._org._id };
  if (name) {
    filterQuery.name = { $regex: name, $options: "i" };
  }
  let sortQuery = {};
  if (sortBy) {
    sortQuery[sortBy] = 1;
  }
  const results = await Product.find(filterQuery)
    .sort(sortQuery)
    .skip((currentPage - 1) * itemsPerPage)
    .limit(itemsPerPage);

  const totalProducts = await Product.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  return res.status(200).json({
    results,
    totalProducts,
    totalPages: totalPages,
    page: currentPage,
    limit: itemsPerPage,
  });
}
async function handleGetProduct(req, res) {
  // const user = req.user;
  const productId = req.params.productId;
  const result = await Product.findById({ _id: productId });
  if (!result) {
    return res.status(404).json({ message: "No product found." });
  }
  return res.status(200).json(result);
}
async function handleUpdateProduct(req, res) {
  const { name, description, price } = req.body;
  const productId = req.params.productId;
  const product = await Product.findById({ _id: productId });
  if (!product) {
    return res.json({ message: "No Product Found." });
  }
  product.name = name;
  product.description = description;
  product.price = price;
  await product.save();
  return res.json({ message: "Product Update Successfully.", item: product });
}
async function handleUpdateProductImages(req, res) {
  const productId = req.params.productId;
  const product = await Product.findById({ _id: productId });
  const { name, description, price } = req.body;
  const imageToDelete = req.body;
  const imageUrls = product.images;

  if (req.files || req.files.length !== 0) {
    for (const file of req.files) {
      const uploadResult = await cloudinary.uploader.upload(file.path);
      const optimizeUrl = cloudinary.url(uploadResult.public_id, {
        fetch_format: "auto",
        quality: "auto",
      });
      imageUrls.push({
        public_id: uploadResult.public_id,
        url: optimizeUrl,
      });
    }
  }
  cloudinary.api
    .delete_resources(imageToDelete.images_to_delete)
    .then((result) => console.log(result));

  product.images = imageUrls.filter(
    (img) => !imageToDelete.images_to_delete.includes(img.public_id)
  );

  await product.save();
  return res
    .status(200)
    .json({ message: "Product Image Updated Successfully" });
}
async function handleDeleteProduct(req, res) {
  const productId = req.params.productId;
  const product = await Product.findByIdAndDelete({ _id: productId });
  if (!product) {
    return res.json({ message: "No Product Found." });
  }
  return res.json({ message: "Product Deleted Successfully." });
}
module.exports = {
  handleCreateProduct,
  handleGetAllProducts,
  handleGetProduct,
  handleUpdateProduct,
  handleUpdateProductImages,
  handleDeleteProduct,
};
