// Problem.js
const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  timel: {
    type: Number,
    required: true,
  },
  meml: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  statement: {
    type: String,
    required: true,
  },
  inputcriteria: {
    type: String,
    required: true,
  },
  outputcriteria: {
    type: String,
    required: true,
  },
  examples: [
    {
      exinput: String,
      exoutput: String,
    },
  ],
  testcases: [
    {
      testinput: String,
      testoutput: String,
    },
  ],
  notes: {
    type: String,
  },
  solvers: {
    type: Number,
    required: true,
  },
  acceptance: {
    type: Number,
    default: null,
    required: true,
  },
});

module.exports = mongoose.model("Problem", problemSchema);
