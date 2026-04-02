const fs = require("fs");
const path = require("path");

const CryptoUtil = require("./CryptoUtil");
const createSeedData = require("../data/seed");

const dbPath = path.join(__dirname, "..", "data", "db.json");

function clone(value) {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.parse(JSON.stringify(value));
}

function ensureFile() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(createSeedData(), null, 2));
  }
}

function readData() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  return data;
}

function sanitizeCustomer(customer) {
  if (!customer) {
    return null;
  }

  const safeCustomer = clone(customer);
  delete safeCustomer.password;
  delete safeCustomer.token;
  return safeCustomer;
}

module.exports = {
  readData,
  writeData,
  clone,
  sanitizeCustomer,
  generateId: CryptoUtil.generateId
};
