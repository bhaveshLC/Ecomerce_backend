const express = require("express");
const cors = require("cors");
const path = require("path");
const { companyRouter } = require("./routes/company");
const { connectToDB } = require("./connection");
const { productsRoute } = require("./routes/product");
const multer = require("multer");
const { shopRoute } = require("./routes/shop");
const { customerRouter } = require("./routes/customer");
// const passport = require("passport");
// const session = require("express-session");
require("dotenv").config();

const app = express();
app.use(cors());
const storage = multer.memoryStorage(); // You can also change this to diskStorage if needed
const upload = multer({ storage }).array("images"); // 'images' is the field name that matches

app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: false })); //

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

connectToDB(process.env.DB_URL);
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/", companyRouter);
app.use("/products", productsRoute);
app.use("/shop", shopRoute);
app.use("/customer", customerRouter);
app.listen(process.env.PORT, () =>
  console.log(`Server started at ${process.env.PORT}`)
);
