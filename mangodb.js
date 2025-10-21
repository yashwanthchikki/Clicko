const mongoose = require("mongoose");
require("dotenv").config();

const connectdb = async () => {
  console.log(process.env.MONGO_URI)
  try {
    await mongoose.connect(
      "mongodb+srv://citizen:5F5LUWq0MOMW9wnx@citizen.i5mugkd.mongodb.net/myDB?retryWrites=true&w=majority&tls=true&tlsInsecure=false",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
};

module.exports = connectdb;
