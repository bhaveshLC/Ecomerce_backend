const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _org: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: {
      type: [
        {
          public_id: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
    },
    price: { type: Number, required: true },
  },
  {
    collection: "products",
    versionKey: false,
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
