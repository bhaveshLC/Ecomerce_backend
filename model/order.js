const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    items: {
      type: [
        {
          productId: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number, required: true },
          qty: { type: Number, required: true },
          subTotal: { type: Number, required: true },
        },
      ],
    },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    address: {
      type: {
        street: { type: String, required: true },
        addressLine2: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pin: { type: String, required: true },
      },
    },
    paymentStatus: { type: String, required: true },
    sellerId: { type: String, required: true },
    transactionNo: { type: String },
    status: { type: String, required: true },
    createdBy: { type: String, required: true },
    deleted: { type: String, required: true },
  },
  {
    collection: "order",
    versionKey: false,
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
