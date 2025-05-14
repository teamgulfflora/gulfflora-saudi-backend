const express = require("express");
const router = express.Router();

const collections = require("./collections/index");
const products = require("./products/index");
const cities = require("./cities/index");
const discounts = require("./discounts/index");
const orders = require("./orders/index");
const search = require("./search/index");
const adminProducts = require("./admin/products/index");

router.use("/collections", collections);
router.use("/products", products);
router.use("/cities", cities);
router.use("/discounts", discounts);
router.use("/orders", orders);
router.use("/search", search);
router.use("/admin/products", adminProducts);

module.exports = router;