const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const MyConstants = require("./MyConstants");
const createSeedData = require("../data/seed");
const Models = require("../models/Models");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

let connectPromise = null;
let seeded = false;

function getUri() {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  if (
    MyConstants.DB_SERVER.includes("<") ||
    MyConstants.DB_USER.includes("<") ||
    MyConstants.DB_PASS.includes("<")
  ) {
    return null;
  }

  return (
    "mongodb+srv://" +
    MyConstants.DB_USER +
    ":" +
    MyConstants.DB_PASS +
    "@" +
    MyConstants.DB_SERVER +
    "/" +
    MyConstants.DB_DATABASE
  );
}

async function seedIfEmpty() {
  if (seeded || !mongoose.connection.readyState) {
    return;
  }

  const [admins, categories, customers, products, orders] = await Promise.all([
    Models.Admin.countDocuments(),
    Models.Category.countDocuments(),
    Models.Customer.countDocuments(),
    Models.Product.countDocuments(),
    Models.Order.countDocuments()
  ]);

  if (admins || categories || customers || products || orders) {
    seeded = true;
    return;
  }

  const data = createSeedData();

  await Models.Admin.insertMany(data.admins);
  await Models.Category.insertMany(data.categories);
  await Models.Customer.insertMany(data.customers);
  await Models.Product.insertMany(data.products);
  await Models.Order.insertMany(data.orders);

  seeded = true;
  console.log("MongoDB Atlas seeded with starter data");
}

const MongooseUtil = {
  async connect() {
    const uri = getUri();

    if (mongoose.connection.readyState === 1) {
      await seedIfEmpty();
      return true;
    }

    if (!uri) {
      return false;
    }

    if (connectPromise) {
      return connectPromise;
    }

    connectPromise = mongoose
      .connect(uri, {
        dbName: process.env.DB_DATABASE || MyConstants.DB_DATABASE
      })
      .then(async function () {
        console.log("Connected to MongoDB Atlas");
        await seedIfEmpty();
        return true;
      })
      .catch(function (error) {
        console.warn("MongoDB connection skipped:", error.message);
        return false;
      })
      .finally(function () {
        connectPromise = null;
      });

    return connectPromise;
  },
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
};

module.exports = MongooseUtil;
