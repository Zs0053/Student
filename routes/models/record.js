const mongoose = require("mongoose");

// Input: id:1, service_type: Deposit, amount:100
// API
// Record:
//      previous_balance = user.current_balance
//      current_balance = previous_balance + amount
// User:
//      update current_balance
const recordSchema = new mongoose.Schema({
  id : {
    type: Number,
    required: true,
    index: true,
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

const Record = mongoose.model("Record", recordSchema);

module.exports = Record;
