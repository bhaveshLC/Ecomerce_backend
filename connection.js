const mongoose = require("mongoose");

const connectToDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("Database Connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
module.exports = {
  connectToDB,
};
