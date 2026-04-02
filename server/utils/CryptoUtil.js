const crypto = require("crypto");

const CryptoUtil = {
  md5(input) {
    return crypto.createHash("md5").update(String(input)).digest("hex");
  },
  randomToken() {
    return crypto.randomBytes(16).toString("hex");
  },
  generateId() {
    return crypto.randomBytes(12).toString("hex");
  }
};

module.exports = CryptoUtil;
