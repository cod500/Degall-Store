const express = require("express");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const router = express.Router();

//Get register page
router.get("/users/register", (req, res) => {
  res.render("register");
});

// Post user registration
router.post(
  "/users/register",
  [
    check("name")
      .not()
      .isEmpty()
      .withMessage("Must have a name"),
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email"),
    check("username")
      .not()
      .isEmpty()
      .withMessage("Must have username"),
    check("password")
      .not()
      .isEmpty()
      .withMessage("Must have passowrd")
      .isLength({ min: 8 })
      .withMessage("Password must be more than 8 characters"),
    check("confirm")
      .not()
      .isEmpty()
      .withMessage("Must confirm passowrd")
  ],
  async (req, res) => {
    const errors = validationResult(req).array();

    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirm;

    if (errors.length > 0) {
      req.session.errors = errors;
      res.render("register", {
        errors: req.session.errors,
        name,
        email,
        username
      });
    } else {
      if (req.body.password !== req.body.confirm) {
        res.render("register", {
          errors: [
            {
              msg: "Passwords must match"
            }
          ],
          name,
          email,
          username
        });
      } else {
        try {
          let customErrors = [];
          const checkUsername = await User.findOne({
            username: req.body.username
          });
          const checkEmail = await User.findOne({ email: req.body.email });

          if (checkUsername) {
            if (checkUsername.username === username) {
              customErrors.push({ text: "Username already taken" });
            }
          }

          if (checkEmail) {
            if (checkEmail.email === email) {
              customErrors.push({ text: "Email already taken" });
            }
          }
          if (customErrors.length > 0) {
            res.render("register", {
              customErrors,
              name: req.body.name,
              email: req.body.email,
              username: req.body.username
            });
          } else {
            const user = new User({
              name: name,
              email: email,
              password: password,
              username: username,
              admin: 0
            });

            await user.save();
            req.flash("success_msg", "You are registered");
            res.redirect("/");
          }
        } catch (e) {
          res.send(e);
        }
      }
    }
  }
);

//Get login page
router.get("/users/login", (req, res) => {
  if (req.user) {
    res.redirect("/products");
  } else {
    res.render("login");
  }
});

//Log in user
router.post("/users/login", async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/products",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

//Get logout page
router.get("/users/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
});

module.exports = router;
