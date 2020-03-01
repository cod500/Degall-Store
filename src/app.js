const path = require("path");
const express = require("express");
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const passport = require("passport");
const multer = require("multer");
const { check, validationResult } = require("express-validator");
const stripe = require("stripe");
require("./db/mongoose");

// Load Routers
const indexRouter = require("./routers/index");
const adminPageRouter = require("./routers/admin-pages");
const adminCategoryRouter = require("./routers/admin-categories");
const adminProductRouter = require("./routers/admin-products");
const pagesRouter = require("./routers/pages");
const productRouter = require("./routers/products");
const cartRouter = require("./routers/cart");
const userRouter = require("./routers/users");

// Handlebars helpers
const { countCheck, fixed, cartTotal, stripeTotal, pubKey} = require("../helpers/hbs");

//init express
const app = express();
const port = process.env.PORT

//Handlbars middleware
app.engine(
  "handlebars",
  hbs({
    defaultLayout: "main",
    helpers: {
      countCheck,
      fixed,
      cartTotal,
      stripeTotal,
      pubKey
    }
  })
);
app.set("view engine", "handlebars");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Static folder
app.use(express.static(path.join("public")));

//Method override middleware
app.use(methodOverride("_method"));

//Express-session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(cors());

app.use(cookieParser());

// Connect-flash middleware
app.use(flash());

// get Page model
const Page = require("./models/pages");

// get all pages
Page.find({}).exec(function(err, pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

// Get Category model
const Category = require("./models/category");

// get all categories
Category.find({}).exec(function(err, categories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

// Get Product model
const Product = require("./models/product");

// get all products
Product.find({}).exec(function(err, products) {
  if (err) {
    console.log(err);
  } else {
    app.locals.products = products;
  }
});

// passport middleware
require("../auth/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

//Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  res.locals.cart = req.session.cart;
  next();
});

app.use(indexRouter);
app.use(userRouter);
app.use(adminPageRouter);
app.use(adminCategoryRouter);
app.use(adminProductRouter);
app.use(cartRouter);
app.use(productRouter);
app.use(pagesRouter);

app.get("*", function(req, res) {
  res.redirect("/");
});

//Start server
app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
