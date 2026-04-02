const CryptoUtil = require("../utils/CryptoUtil");
const { getProductImage } = require("./productImages");

function createImage(label, background, foreground) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">` +
    `<rect width="100%" height="100%" fill="${background}" />` +
    `<text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="Arial" font-size="46" fill="${foreground}">${label}</text>` +
    `</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

module.exports = function createSeedData() {
  const ids = {
    admin: "64b100000000000000000001",
    customer: "64b100000000000000000002",
    categoryPhone: "64b100000000000000000101",
    categoryLaptop: "64b100000000000000000102",
    categoryWatch: "64b100000000000000000103",
    productPhone: "64b100000000000000000201",
    productLaptop: "64b100000000000000000202",
    productWatch: "64b100000000000000000203",
    productTablet: "64b100000000000000000204",
    productHeadphone: "64b100000000000000000205",
    productCamera: "64b100000000000000000206",
    orderApproved: "64b100000000000000000301",
    orderPending: "64b100000000000000000302"
  };

  const categories = [
    { _id: ids.categoryPhone, name: "Phone" },
    { _id: ids.categoryLaptop, name: "Laptop" },
    { _id: ids.categoryWatch, name: "Watch" }
  ];

  function findCategory(id) {
    return JSON.parse(JSON.stringify(categories.find(function (item) {
      return item._id === id;
    })));
  }

  const products = [
    {
      _id: ids.productPhone,
      name: "iPhone 16",
      price: 1199,
      image: getProductImage(
        "iPhone 16",
        createImage("iPhone 16", "#0f172a", "#f8fafc")
      ),
      cdate: Date.parse("2026-03-01T09:00:00Z"),
      category: findCategory(ids.categoryPhone)
    },
    {
      _id: ids.productLaptop,
      name: "MacBook Air M4",
      price: 1499,
      image: getProductImage(
        "MacBook Air M4",
        createImage("MacBook Air", "#1d4ed8", "#eff6ff")
      ),
      cdate: Date.parse("2026-02-20T09:00:00Z"),
      category: findCategory(ids.categoryLaptop)
    },
    {
      _id: ids.productWatch,
      name: "Apple Watch S11",
      price: 499,
      image: createImage("Watch S11", "#065f46", "#ecfdf5"),
      cdate: Date.parse("2026-02-15T09:00:00Z"),
      category: findCategory(ids.categoryWatch)
    },
    {
      _id: ids.productTablet,
      name: "Galaxy Tab X",
      price: 899,
      image: getProductImage(
        "Galaxy Tab X",
        createImage("Galaxy Tab", "#9a3412", "#fff7ed")
      ),
      cdate: Date.parse("2026-03-05T09:00:00Z"),
      category: findCategory(ids.categoryPhone)
    },
    {
      _id: ids.productHeadphone,
      name: "Sony WH-1000XM7",
      price: 379,
      image: createImage("WH-1000XM7", "#7c2d12", "#ffedd5"),
      cdate: Date.parse("2026-02-28T09:00:00Z"),
      category: findCategory(ids.categoryPhone)
    },
    {
      _id: ids.productCamera,
      name: "Canon R10",
      price: 1049,
      image: createImage("Canon R10", "#581c87", "#faf5ff"),
      cdate: Date.parse("2026-01-25T09:00:00Z"),
      category: findCategory(ids.categoryLaptop)
    }
  ];

  const customer = {
    _id: ids.customer,
    username: "customer",
    password: CryptoUtil.md5("123"),
    name: "Minh Cuong",
    phone: "0900000000",
    email: "customer@example.com",
    active: 1,
    token: ""
  };

  const customerSnapshot = {
    _id: customer._id,
    username: customer.username,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    active: customer.active
  };

  const orders = [
    {
      _id: ids.orderApproved,
      cdate: Date.parse("2026-03-07T09:00:00Z"),
      total: 2897,
      status: "APPROVED",
      customer: customerSnapshot,
      items: [
        { product: products[0], quantity: 1 },
        { product: products[1], quantity: 1 },
        { product: products[2], quantity: 2 }
      ]
    },
    {
      _id: ids.orderPending,
      cdate: Date.parse("2026-03-09T09:00:00Z"),
      total: 379,
      status: "PENDING",
      customer: customerSnapshot,
      items: [{ product: products[4], quantity: 1 }]
    }
  ];

  return {
    admins: [
      {
        _id: ids.admin,
        username: "admin",
        password: CryptoUtil.md5("123")
      }
    ],
    categories,
    customers: [customer],
    products,
    orders
  };
};
