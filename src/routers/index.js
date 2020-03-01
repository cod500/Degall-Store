const express = require("express");
const { ensureAdmin } = require("../../middleware/auth");
const router = express.Router();

// Get home page
router.get("/", (req, res) => {
  res.render("index");
});

//Get admin home page
router.get("/admin", ensureAdmin, (req, res) => {
  res.render("admin/index");
});

module.exports = router;
