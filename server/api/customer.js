const express = require("express");

const CategoryDAO = require("../models/CategoryDAO");
const ProductDAO = require("../models/ProductDAO");
const CustomerDAO = require("../models/CustomerDAO");
const OrderDAO = require("../models/OrderDAO");
const CryptoUtil = require("../utils/CryptoUtil");
const EmailUtil = require("../utils/EmailUtil");
const JwtUtil = require("../utils/JwtUtil");
const { sanitizeCustomer } = require("../utils/Store");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/categories", asyncHandler(async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
}));

router.get("/products/new", asyncHandler(async function (req, res) {
  const products = await ProductDAO.selectTopNew(3);
  res.json(products);
}));

router.get("/products/hot", asyncHandler(async function (req, res) {
  const products = await ProductDAO.selectTopHot(3);
  res.json(products);
}));

router.get("/products/category/:cid", asyncHandler(async function (req, res) {
  const products = await ProductDAO.selectByCatID(req.params.cid);
  res.json(products);
}));

router.get("/products/search/:keyword", asyncHandler(async function (req, res) {
  const products = await ProductDAO.selectByKeyword(req.params.keyword);
  res.json(products);
}));

router.get("/products/:id", asyncHandler(async function (req, res) {
  const product = await ProductDAO.selectByID(req.params.id);
  res.json(product);
}));

router.post("/signup", asyncHandler(async function (req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const email = String(req.body.email || "").trim();

  if (!username || !password || !name || !phone || !email) {
    return res.json({
      success: false,
      message: "Please enter all required fields."
    });
  }

  const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
  if (dbCust) {
    return res.json({
      success: false,
      message: "Username or email already exists."
    });
  }

  const token = CryptoUtil.md5(Date.now().toString());
  const customer = await CustomerDAO.insert({
    username,
    password: CryptoUtil.md5(password),
    name,
    phone,
    email,
    active: 0,
    token
  });

  const activation = await EmailUtil.send(email, customer._id, token);

  return res.json({
    success: true,
    message: activation
      ? "Please check your email to activate your account."
      : "Unable to send activation email.",
    customer,
    activation
  });
}));

router.post("/active", asyncHandler(async function (req, res) {
  const id = String(req.body.id || "").trim();
  const token = String(req.body.token || "").trim();

  if (!id || !token) {
    return res.json({
      success: false,
      message: "Please enter account ID and activation token."
    });
  }

  const customer = await CustomerDAO.active(id, token, 1);

  if (!customer) {
    return res.json({
      success: false,
      message: "Invalid account ID or activation token."
    });
  }

  return res.json({
    success: true,
    message: "Account activated successfully.",
    customer
  });
}));

router.post("/login", asyncHandler(async function (req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Please enter username and password."
    });
  }

  const customer = await CustomerDAO.selectByUsernameAndPassword(
    username,
    CryptoUtil.md5(password)
  );

  if (!customer) {
    return res.json({
      success: false,
      message: "Invalid username or password."
    });
  }

  if (customer.active !== 1) {
    return res.json({
      success: false,
      message: "This account has not been activated."
    });
  }

  return res.json({
    success: true,
    message: "Login successful.",
    token: JwtUtil.genToken({
      role: "customer",
      customerId: customer._id,
      username: customer.username
    }),
    customer: sanitizeCustomer(customer)
  });
}));

router.get("/token", JwtUtil.checkToken, function (req, res) {
  const token = JwtUtil.extractToken(req);
  res.json({
    success: true,
    message: "Token valid.",
    token
  });
});

router.put("/customers/:id", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const id = String(req.params.id || "").trim();
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const email = String(req.body.email || "").trim();

  if (!id || !username || !password || !name || !phone || !email) {
    return res.json(null);
  }

  const customer = await CustomerDAO.update({
    _id: id,
    username,
    password: CryptoUtil.md5(password),
    name,
    phone,
    email
  });

  return res.json(customer);
}));

router.post("/checkout", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const total = Number(req.body.total);
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const customer = req.body.customer ? sanitizeCustomer(req.body.customer) : null;

  if (!Number.isFinite(total) || items.length === 0 || !customer) {
    return res.json(null);
  }

  const order = await OrderDAO.insert({
    cdate: Date.now(),
    total,
    status: "PENDING",
    customer,
    items
  });

  return res.json(order);
}));

router.get(
  "/orders/customer/:cid",
  JwtUtil.checkToken,
  asyncHandler(async function (req, res) {
    const orders = await OrderDAO.selectByCustID(req.params.cid);
    res.json(orders);
  })
);

module.exports = router;
