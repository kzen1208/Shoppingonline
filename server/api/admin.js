const express = require("express");

const CryptoUtil = require("../utils/CryptoUtil");
const EmailUtil = require("../utils/EmailUtil");
const JwtUtil = require("../utils/JwtUtil");
const AdminDAO = require("../models/AdminDAO");
const CategoryDAO = require("../models/CategoryDAO");
const CustomerDAO = require("../models/CustomerDAO");
const ProductDAO = require("../models/ProductDAO");
const OrderDAO = require("../models/OrderDAO");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/login", asyncHandler(async function (req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Please input username and password"
    });
  }

  const admin = await AdminDAO.selectByUsernameAndPassword(
    username,
    CryptoUtil.md5(password)
  );

  if (!admin) {
    return res.json({
      success: false,
      message: "Incorrect username or password"
    });
  }

  return res.json({
    success: true,
    message: "Authentication successful",
    token: JwtUtil.genToken({ role: "admin", username })
  });
}));

router.get("/token", JwtUtil.checkToken, function (req, res) {
  const token = JwtUtil.extractToken(req);
  res.json({
    success: true,
    message: "Token is valid",
    token
  });
});

router.get("/categories", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
}));

router.get("/customers", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const customers = await CustomerDAO.selectAll();
  res.json(customers);
}));

router.put(
  "/customers/deactive/:id",
  JwtUtil.checkToken,
  asyncHandler(async function (req, res) {
    const id = String(req.params.id || "").trim();
    const token = String(req.body.token || "");

    if (!id) {
      return res.json(null);
    }

    const result = await CustomerDAO.active(id, token, 0);
    return res.json(result);
  })
);

router.get(
  "/customers/sendmail/:id",
  JwtUtil.checkToken,
  asyncHandler(async function (req, res) {
    const id = String(req.params.id || "").trim();
    const customer = await CustomerDAO.selectByID(id);

    if (!customer) {
      return res.json({
        success: false,
        message: "Customer does not exist."
      });
    }

    if (!customer.token) {
      return res.json({
        success: false,
        message: "Customer does not have an activation token."
      });
    }

    const send = await EmailUtil.send(customer.email, customer._id, customer.token);

    return res.json({
      success: !!send,
      message: send ? "Please check email." : "Email failure."
    });
  })
);

router.post("/categories", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.json(null);
  }

  const category = await CategoryDAO.insert({ name });
  return res.json(category);
}));

router.put("/categories/:id", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const id = req.params.id;
  const name = String(req.body.name || "").trim();

  if (!id || !name) {
    return res.json(null);
  }

  const category = await CategoryDAO.update({ _id: id, name });
  return res.json(category);
}));

router.delete("/categories/:id", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const id = req.params.id;
  const result = await CategoryDAO.delete(id);
  return res.json(result);
}));

router.get("/products", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  let products = await ProductDAO.selectAll();
  const sizePage = 4;
  const noPages = Math.ceil(products.length / sizePage);
  const curPage = Math.max(parseInt(req.query.page || "1", 10), 1);
  const offset = (curPage - 1) * sizePage;

  products = products.slice(offset, offset + sizePage);

  res.json({
    products,
    noPages,
    curPage
  });
}));

router.post("/products", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const name = String(req.body.name || "").trim();
  const price = Number(req.body.price);
  const categoryId = String(req.body.category || "").trim();
  const image = String(req.body.image || "").trim();
  const category = await CategoryDAO.selectByID(categoryId);

  if (!name || !Number.isFinite(price) || !category || !image) {
    return res.json(null);
  }

  const product = await ProductDAO.insert({
    name,
    price,
    image,
    cdate: Date.now(),
    category
  });

  return res.json(product);
}));

router.put("/products/:id", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const id = req.params.id;
  const name = String(req.body.name || "").trim();
  const price = Number(req.body.price);
  const categoryId = String(req.body.category || "").trim();
  const image = String(req.body.image || "").trim();
  const category = await CategoryDAO.selectByID(categoryId);

  if (!id || !name || !Number.isFinite(price) || !category || !image) {
    return res.json(null);
  }

  const product = await ProductDAO.update({
    _id: id,
    name,
    price,
    image,
    cdate: Date.now(),
    category
  });

  return res.json(product);
}));

router.delete("/products/:id", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const id = req.params.id;
  const result = await ProductDAO.delete(id);
  return res.json(result);
}));

router.get("/orders", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const orders = await OrderDAO.selectAll();
  return res.json(orders);
}));

router.get(
  "/orders/customer/:cid",
  JwtUtil.checkToken,
  asyncHandler(async function (req, res) {
    const cid = String(req.params.cid || "").trim();
    const orders = await OrderDAO.selectByCustID(cid);
    return res.json(orders);
  })
);

router.put("/orders/status/:id", JwtUtil.checkToken, asyncHandler(async function (req, res) {
  const id = req.params.id;
  const status = String(req.body.status || "").trim().toUpperCase();

  if (!id || !["APPROVED", "CANCELED"].includes(status)) {
    return res.json(null);
  }

  const result = await OrderDAO.update(id, status);
  return res.json(result);
}));

module.exports = router;
