const mongoose = require("mongoose");

// id: 1, name: Alice, current_balance: 0, time: now
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  userhash: {
    type: String,
    required: true,
  }
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;