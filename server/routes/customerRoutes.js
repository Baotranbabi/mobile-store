const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  getCustomers,
  createCustomer,
} = require("../controllers/customerController");

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/", getCustomers);
router.post("/", createCustomer);

module.exports = router;