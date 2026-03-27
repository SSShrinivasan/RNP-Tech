const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: false
  },
  password: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);