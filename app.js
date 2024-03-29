const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

const app = express();

//Connecting to database
mongoose.connect(process.env.DB_CONNECTION, () => console.log("Connected to database"));

//Middlewares
app.use(express.json());
app.use(cors());

//Users Route
const userAuthRoute = require("./routes/users/auth");
app.use("/api/user", userAuthRoute);

//Products Route
const productRoute = require("./routes/products/products");
app.use("/api/product", productRoute);

//Cart Route
const cartRoute = require("./routes/cart/cart");
app.use("/api/cart", cartRoute);

app.listen(3000, () => console.log("Server is running"));
