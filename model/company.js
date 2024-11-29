const mongoose = require("mongoose");

const OrgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    deleted: { type: Boolean, default: false },
  },
  {
    collection: "org",
    versionKey: false,
  },
  {
    timestamps: true,
  }
);
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    _org: { type: OrgSchema, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ["admin", "user"] },
    isEmailVerified: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  {
    collection: "seller",
    versionKey: false,
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
const org = mongoose.model("Org", OrgSchema);
module.exports = { User, org };
