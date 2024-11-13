require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const frontendURL = process.env.frontendURL;
const corsOptions = {
  origin: frontendURL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

const homeRouter = require("../Backend/routes/home");
const checkoutRouter = require("../Backend/routes/checkout");
const addProductsRouter = require("../Backend/routes/addProducts");
const editRouter = require("../Backend/routes/edit");
const deleteRouter = require("../Backend/routes/delete");
const searchRouter = require("../Backend/routes/search_filter");
const userRouter = require("./routes/userRouter");
const ownerRouter = require("./routes/ownerRouter");
const productApiRouter = require("./routes/products_api");

app.use("/", homeRouter);
app.use("/orders", checkoutRouter);
app.use("/addproducts", addProductsRouter);
app.use("/edit-product", editRouter);
app.use("/delete-product", deleteRouter);
app.use("/search", searchRouter);
app.use("/users", userRouter);
app.use("/authorizedparty", ownerRouter);
app.use("/api", productApiRouter);
const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
