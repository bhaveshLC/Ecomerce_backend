const express = require("express");
const { connectToDB } = require("./connection");
const { companyRouter } = require("./routes/company");
require("dotenv").config();
// console.log(dotenv);
const app = express();
connectToDB(process.env.DB_URL);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", companyRouter);
app.listen(process.env.PORT, () =>
  console.log(`Server Started at ${process.env.PORT}`)
);
