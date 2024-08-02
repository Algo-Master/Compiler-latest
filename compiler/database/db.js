// This is a gerneralized template which can be used in other projects as well!!

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DBConnection = async () => {
  const MONGO_URI = process.env.MONGODB_URL;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connection established");
  } catch (error) {
    console.log(`Error while establishing the MongoDB connection : ${error}`);
  }
};

module.exports = { DBConnection };