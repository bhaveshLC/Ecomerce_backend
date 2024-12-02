const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String, required: true },
    address: {
      type: [
        {
          street: { type: String, required: true },
          addressLine2: { type: String, required: true },
          city: { type: String, required: true },
          state: { type: String, required: true },
          pin: { type: String, required: true },
        },
      ],
    },
  },
  {
    collection: "customer",
    versionKey: false,
    timestamps: true,
  }
);
const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;
