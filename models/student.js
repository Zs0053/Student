const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 18,
    max: [80, "Too old in this school"],
  },
  scholarship: {
    merit: {
      type: Number,
      min: 0,
      max: [5000, "Too much merit scholarship"],
    },
    other: {
      type: Number,
      min: 0,
    },
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
