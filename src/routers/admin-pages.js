const express = require("express");
const router = express.Router();
const Page = require("../models/pages");
const {ensureAdmin} = require('../../middleware/auth');
const { check, validationResult } = require("express-validator");
const flash = require("connect-flash");

// Admin page
router.get("/admin/pages",ensureAdmin, async (req, res) => {

  try {
    const pages = await Page.find({}).sort({ sorting: 1 });
    res.render("admin/admin-pages", {
      pages
    });
  } catch (e) {
    console.log(e);
  }
});

//Admin add page
router.get("/admin/page/add",ensureAdmin, (req, res) => {
  const page = {
    title: "",
    slug: "",
    content: ""
  };

  res.render("admin/add-page", {
    page,
  });
});

//Post pages
router.post(
  "/admin/page/add",ensureAdmin,
  [
    check("title")
      .not()
      .isEmpty()
      .withMessage("must have a title"),
    check("content")
      .not()
      .isEmpty()
      .withMessage("must have content")
  ],
  async (req, res) => {
    let errors = validationResult(req).array();

    if (errors.length > 0) {
      req.session.errors = errors;
      res.render("admin/add-page", {
        errors: req.session.errors,
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content
      });
    } else {
      let slug = "";

      try {
        if (req.body.slug) {
          slug = req.body.slug.toLowerCase().replace(/\s+/g, "-");
        } else {
          slug = req.body.title.toLowerCase().replace(/\s+/g, "-");
        }

        const checkSlug = await Page.find({ slug: slug });
        if (checkSlug.length > 0) {
          res.render("admin/add-page", {
            error: "Slug must be unique",
            title: req.body.title,
            content: req.body.content
          });
        } else {
          const page = new Page({
            title: req.body.title,
            slug: slug,
            content: req.body.content
          });

          await page.save();
          const pages = await Page.find({});
          req.app.locals.pages = pages;

          res.redirect("/admin/pages");
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

// Get edit page
router.get("/admin/page/edit/:id",ensureAdmin, async (req, res) => {

  try {
    const page = await Page.findById(req.params.id);
    res.render("admin/edit-page", {
      page
    });
  } catch (e) {
    res.status(500).send();
  }
});

//Put Request
router.put("/admin/page/edit/:id",ensureAdmin, async (req, res) => {
  let errors = [];
  if (!req.body.title) errors.push({ text: "Please provide a title" });
  if (!req.body.content) errors.push({ text: "Please provide content" });

  if (errors.length > 0) {
    res.render("admin/edit-page", {
      errors,
      page: {
        title: req.body.title,
        slug: req.body.slug,
        id: req.params.id
      }
    });
  } else {
    try {
      const checkSlug = await Page.find({ slug: req.params.slug });
      if (checkSlug.length > 0) {
        res.render("admin/edit-page", {
          error: "Slug must be unique",
          title: req.body.title,
          content: req.body.content
        });
      } else {
        try {
          const page = await Page.findOne({ _id: req.params.id });

          //update values
          page.title = req.body.title;
          page.content = req.body.content;
          page.slug = req.body.slug;

          await page.save();
          const pages = await Page.find({});
          req.app.locals.pages = pages;
          res.redirect("/admin/pages");
        } catch (e) {
          res.status(500).send();
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
});

//Delete page
router.delete("/admin/page/delete/:id",ensureAdmin, async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete({ _id: req.params.id });
    const pages = await Page.find({});
    req.app.locals.pages = pages;
    res.redirect("/admin/pages");
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
