const express = require("express");
const router = express.Router();
const Page = require("../models/pages");

router.get("/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) {
      res.redirect("/");
    } else {
      res.render("pages", {
        title: page.title,
        content: page.content
      });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
