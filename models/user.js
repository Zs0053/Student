const mongoose = require("mongoose");

// id: 1, name: Alice, current_balance: 0, time: now
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
  current_balance: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  time: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
