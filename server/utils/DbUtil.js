const mongoose = require("mongoose");

const MongooseUtil = require("./MongooseUtil");

function normalize(value) {
  if (value === undefined) {
    return null;
  }

  return JSON.parse(JSON.stringify(value));
}

function toObjectId(id) {
  if (!id) {
    return null;
  }

  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }

  return id;
}

module.exports = {
  isMongoReady() {
    return MongooseUtil.isConnected();
  },
  normalize,
  toObjectId
};
