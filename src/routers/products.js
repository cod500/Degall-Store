const express = require("express");
const router = express.Router();
const Product = require("../models/product");

//Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("all-products", {
      products
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

//Get products by category
router.get("/products/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.render("category-products", {
      products,
      category: req.params.category
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

//Get single product
router.get("/products/:category/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      res.redirect("/");
    } else {
      res.render("product-details", {
        product
      });
    }
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
