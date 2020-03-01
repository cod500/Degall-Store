const express = require("express");
const Category = require("../models/category");
const {ensureAdmin} = require('../../middleware/auth');
const router = express.Router();

// Get categories index
router.get("/admin/categories", ensureAdmin, async (req, res) => {
  
  try {
    const categories = await Category.find({});
    res.render("admin/admin-categories", {
      categories,
    });
  } catch (e) {
    res.status(500).send();
  }
});

// Get category add page
router.get("/admin/category/add", ensureAdmin, (req, res) => {

  res.render("admin/add-category");
});

// Post category
router.post("/admin/category/add", ensureAdmin, async (req, res) => {
  let errors = [];
  if (!req.body.title) errors.push({ msg: "Please provide a title" });

  if (errors.length > 0) {
    res.render("admin/add-category", {
      errors,
      title: req.body.title
    });
  } else {
    try {
      const checkTitle = await Category.find({ title: req.body.title });
      console.log(checkTitle);
      if (checkTitle.length > 0) {
        errors.push();
        res.render("admin/category/add", {
          errors: { msg: "Title must be unique" },
          title: req.body.title
        });
      } else {
        const category = new Category({
          title: req.body.title,
          slug: req.body.title.toLowerCase().replace(/\s+/g, "-")
        });
        console.log(category);

        await category.save();
        const categories = await Category.find({});
        req.app.locals.categories = categories;
        res.redirect("/admin/categories");
      }
    } catch (e) {
      res.status(500).send();
    }
  }
});

// Get category edit page
router.get("/admin/category/edit/:id", ensureAdmin, async (req, res) => {

  try {
    const category = await Category.findById(req.params.id);
    res.render("admin/edit-category", {
      category
    });
  } catch (e) {
    res.status(500).send();
  }
});

//Edit category
router.put("/admin/category/edit/:id", ensureAdmin, async (req, res) => {
  let errors = [];
  if (!req.body.title) errors.push({ msg: "Please provide a title" });

  if (errors.length > 0) {
    res.render("admin/edit-category", {
      errors,
      category: {
        title: req.body.title,
        id: req.params.id
      }
    });
  } else {
    try {
      const checkTitle = await Category.find({ title: req.body.title });
      if (checkTitle.length > 0) {
        errors.push({ msg: "Title must be unique" });
        res.render("admin/edit-category", {
          errors,
          category: {
            title: req.body.title,
            id: req.params.id
          }
        });
      } else {
        try {
          const category = await Category.findById(req.params.id);

          //update values
          category.title = req.body.title;

          await category.save();
          const categories = await Category.find({});
          req.app.locals.categories = categories;
          res.redirect("/admin/categories");
        } catch (e) {
          res.status(500).send();
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
});

// Delete category
router.delete("/admin/category/delete/:id", ensureAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    const categories = await Category.find({});
    req.app.locals.categories = categories;
    req.flash("success_msg", "Deleted");
    res.redirect("/admin/categories");
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
