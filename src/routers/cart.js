const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { ensureAuth } = require("../../middleware/auth");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

//Add product to cart
router.get("/cart/add/:product", ensureAuth, async (req, res) => {
  try {
    let slug = req.params.product;
    const product = await Product.findOne({ slug: slug });

    if (req.session.cart === undefined) {
      req.session.cart = [];
      req.session.num = 1;
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(product.price).toFixed(2),
        image: `/img/products/${product._id}/${product.image}`
      });
    } else {
      let cart = req.session.cart;
      let newItem = true;

      for (let i = 0; i < cart.length; i++) {
        if (cart[i].title === slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(product.price).toFixed(2),
          image: `/img/products/${product._id}/${product.image}`
        });
      }
    }
    req.flash("success_msg", "Product added to cart!");
    res.redirect("back");
  } catch (e) {
    res.send(e);
  }
});

//Get checkout page
router.get("/cart/checkout", ensureAuth, async (req, res) => {
  res.render("checkout", {
    cart: req.session.cart
  });
});

//Update cart
router.get("/cart/checkout/update/:product", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.product });
    const cart = req.session.cart;

    for (let i = 0; i < cart.length; i++) {
      if (product.slug === req.params.product) {
        switch (req.query.action) {
          case "add":
            cart[i].qty++;
            break;
          case "subtract":
            cart[i].qty--;
            if (cart[i].qty < 1) {
              cart.splice(i, 1);
            }
            break;
          case "clear":
            cart.splice(i, 1);
            break;
          default:
            console.log("Action not found");
        }
        break;
      }
    }
    res.redirect("back");
  } catch (e) {
    res.send(e);
  }
});

//Clear cart
router.get("/cart/checkout/clear", ensureAuth, async (req, res) => {
  delete req.session.cart;
  req.flash("success_msg", "Cart is Cleared.");
  res.redirect("back");
});

//Process payment success route
router.get("/cart/success", (req, res) => {
  res.render("success");
});

//Process payment through stripe
router.post("/cart/pay", ensureAuth, async function(req, res) {
  const charge = await stripe.charges.create({
    amount: 999,
    currency: "usd",
    source: "tok_visa",
    receipt_email: "Clay.Degall@example.com",
    description: "Degall Shop checkout"
  });

  delete req.session.cart;

  res.render("success");
});
router.post("/charge", ensureAuth, (req, res) => {
  res.render("success");
});

module.exports = router;
