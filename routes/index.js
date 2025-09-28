const express = require("express");
const router = express.Router();

const collections = require("./collections/index");
const products = require("./products/index");
const cities = require("./cities/index");
const discounts = require("./discounts/index");
const orders = require("./orders/index");
const search = require("./search/index");
const adminProducts = require("./admin/products/index");
const adminCollections = require("./admin/collections/index");
const adminCities = require("./admin/cities/index");
const adminOrders = require("./admin/orders/index");
const adminBlog = require("./admin/blog/index");
const mailer = require("./mailer/index");
const media = require("./media/index");

router.use("/collections", collections);
router.use("/products", products);
router.use("/cities", cities);
router.use("/discounts", discounts);
router.use("/orders", orders);
router.use("/search", search);
router.use("/admin/products", adminProducts);
router.use("/admin/collections", adminCollections);
router.use("/admin/cities", adminCities);
router.use("/admin/orders", adminOrders);
router.use("/admin/blog", adminBlog);
router.use("/mail", mailer);
router.use("/media", media);

module.exports = router;