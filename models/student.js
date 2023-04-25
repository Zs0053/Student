const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id : {
    type: Integer,
    required: true,
    unique: true,
    index: true,
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
    type: Double,
    required: true,
    min: 0.00,
  },
  change_amount: {
    type: Double,
    required: true,
    min: 0.00,
  },
  current_balance: {
    type: Double,
    required: true,
    min: 0.00,
  },
  time: {
    type: Date,
    required: true,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
