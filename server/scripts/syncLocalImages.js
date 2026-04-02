const fs = require("fs");
const path = require("path");

const createSeedData = require("../data/seed");

const dbPath = path.join(__dirname, "..", "data", "db.json");

if (!fs.existsSync(dbPath)) {
  console.log("No local db.json found. Nothing to sync.");
  process.exit(0);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const seed = createSeedData();

const imagesById = new Map(
  seed.products.map(function (product) {
    return [product._id, product.image];
  })
);

db.products = db.products.map(function (product) {
  const image = imagesById.get(product._id);
  if (!image) {
    return product;
  }

  return {
    ...product,
    image
  };
});

db.orders = db.orders.map(function (order) {
  return {
    ...order,
    items: order.items.map(function (item) {
      const image = imagesById.get(item.product._id);
      if (!image) {
        return item;
      }

      return {
        ...item,
        product: {
          ...item.product,
          image
        }
      };
    })
  };
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Local db.json images synced from /img");
