const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id : {
    type: Number,
    required: true,
    index: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  service_type: {
    type: String,
    required: true,
  },
  previous_balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  change_amount: {
    type: Number,
    required: true,
    min: 0.00,
  },
  current_balance: {
    type: Number,
    required: true,
    min: 0.00,
  },
  time: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
