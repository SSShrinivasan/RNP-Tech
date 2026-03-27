// task.model.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  tenantId: {
    type: String,
    required: true,
    index: true   // critical for multi-tenancy
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  }

}, { timestamps: true });


module.exports = mongoose.model("Task", taskSchema);