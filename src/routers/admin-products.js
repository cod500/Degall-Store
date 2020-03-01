const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
const {ensureAdmin} = require('../../middleware/auth');
const multer = require("multer");
const mkdirp = require("mkdirp");
const moveFile = require('move-file');
const fs = require('fs-extra');
const { check, validationResult, body } = require("express-validator");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/img/products");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

//Get all products
router.get("/admin/products",ensureAdmin, async (req, res) => {
  
  try {
    const count = await Product.countDocuments({});
    const products = await Product.find({});

    res.render("admin/admin-products", {
      products,
      count,
      
    });
  } catch (e) {
    res.send(e);
  }
});

// Get add product page
router.get("/admin/product/add",ensureAdmin, async (req, res) => {
  
  try {
    const categories = await Category.find({});
    res.render("admin/add-product", {
      categories,
      
    });
  } catch (e) {
    res.send(e);
  }
});

// Post products
router.post(
  "/admin/product/add",ensureAdmin,
  upload.single("image"),
  [
    check("title")
      .not()
      .isEmpty()
      .withMessage("Title is required"),
    check("description")
      .not()
      .isEmpty()
      .withMessage("Description is required"),
    check("price")
      .not()
      .isEmpty()
      .withMessage("Price is required")
  ],
  async (req, res, next) => {
    const customErrors = [];
    let imageFile;

    if (req.file !== undefined) {
      if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        uploadErrors.push({ text: "Must upload an image" });
      } else {
        imageFile = req.file;
      }
    } else {
      imageFile = '';
    }

    
    const errors = validationResult(req).array();

    try {
      const title = await Product.find({ title: req.body.title });

      if (title.length > 0) {
        customErrors.push({ text: "Title must be unique" });
      }
    } catch (e) {
        res.send(e)
    }

    if (errors.length > 0 || customErrors.length > 0) {
      req.session.errors = errors;
      try {
        const categories = await Category.find({});
        res.render("admin/add-product", {
          errors: req.session.errors,
          customErrors,
          title: req.body.title,
          description: req.body.description,
          categories,
          price: req.body.price,
          imageFile,
        });
      } catch (e) {
        res.send(e);
      }
    } else {
      try {
        const product = new Product({
          title: req.body.title,
          slug: req.body.title.toLowerCase().replace(/\s+/g, "-"),
          description: req.body.description,
          category: req.body.category,
          price: req.body.price,
          image: imageFile.originalname
        });

        // Create product folder for each product 
        if(imageFile !== ''){
            await moveFile(`public/img/products/${imageFile.originalname}`, `public/img/products/${product.id}/${imageFile.originalname}`);
        console.log('The file has been moved');
        }
    
        await product.save();
        const products = await Product.find({});
        req.app.locals.products = products;

        req.flash('success_msg', 'Product created');
        res.redirect("/admin/products");
      } catch (e) {
        res.send(e);
      }
    }
  }
);

//Get edit page
router.get("/admin/product/edit/:id",ensureAdmin, async (req, res) => {

  try {
    const product = await Product.findById(req.params.id);
    const categories = await Category.find({});

    res.render("admin/edit-product", {
      product,
      categories,
    });
  } catch (e) {
    console.log(e);
  }
});

router.put(
  "/admin/product/edit/:id",ensureAdmin,
  upload.single("image"),
  [
    check("title")
      .not()
      .isEmpty()
      .withMessage("Title is required"),
    check("description")
      .not()
      .isEmpty()
      .withMessage("Description is required"),
    check("price")
      .not()
      .isEmpty()
      .withMessage("Price is required")
  ],
  async (req, res) => {
    const customErrors = [];
    let imageFile;

    if (req.file !== undefined) {
      if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        uploadErrors.push({ text: "Must upload an image" });
      }else{
          imageFile = req.file
      }
    }else{
        imageFile='';
    }

    const errors = validationResult(req).array();

    try {
      const title = await Product.find({ title: req.body.title });

      if (title.length > 0) {
        customErrors.push({ text: "Title must be unique" });
      }
    } catch (e) {
        res.send()
    }

    if (errors.length > 0 ) {
      req.session.errors = errors;
      try {
        const categories = await Category.find({});
        res.render("admin/edit-product", {
          errors: req.session.errors,
          categories,
          product: {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            iamge: imageFile,
            id: req.params.id
          }
        });
      } catch (e) {
        res.send(e);
      }
    } else {
      try {
        const product = await Product.findOne({_id: req.params.id})
    
        product.title = req.body.title;
        product.description = req.body.description;
        product.category = req.body.category;
        product.price = req.body.price;
        if(imageFile !== ''){
            product.image = imageFile.originalname;
            await moveFile(`public/img/products/${imageFile.originalname}`, `public/img/products/${product.id}/${imageFile.originalname}`);
        };

        
        
        await product.save();
        const products = await Product.find({});
        req.app.locals.products = products;
        req.flash('success_msg', 'Product edited');
        res.redirect("/admin/products");
      } catch (e) {
        res.send(e);
      }
    }
  }
);

router.delete('/admin/product/delete/:id',ensureAdmin, async (req, res) =>{
    try{
        const product = await Product.findByIdAndDelete({_id: req.params.id} );

        //Remove products folder
        fs.remove('public/img/products/' + product.id).then(() => {
          });

        const products = await Product.find({});
        req.app.locals.products = products;
        req.flash('success_msg', 'Product deleted');
        res.redirect('/admin/products')
    }catch(e){
        res.status(500).send()
    }

})


module.exports = router;
