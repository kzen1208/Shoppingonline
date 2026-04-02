const Models = require("./Models");
const { isMongoReady, normalize, toObjectId } = require("../utils/DbUtil");
const { readData, writeData, clone, generateId } = require("../utils/Store");

const CategoryDAO = {
  async selectAll() {
    if (isMongoReady()) {
      const categories = await Models.Category.find({}).lean();
      return normalize(categories);
    }

    const data = readData();
    return clone(data.categories);
  },
  async selectByID(id) {
    if (isMongoReady()) {
      const category = await Models.Category.findById(toObjectId(id)).lean();
      return normalize(category);
    }

    const data = readData();
    return clone(
      data.categories.find(function (item) {
        return item._id === id;
      })
    );
  },
  async insert(category) {
    if (isMongoReady()) {
      const result = await Models.Category.create({ name: category.name });
      return normalize(result);
    }

    const data = readData();
    const newCategory = {
      _id: generateId(),
      name: category.name
    };

    data.categories.push(newCategory);
    writeData(data);
    return clone(newCategory);
  },
  async update(category) {
    if (isMongoReady()) {
      const result = await Models.Category.findByIdAndUpdate(
        toObjectId(category._id),
        { name: category.name },
        { new: true }
      ).lean();

      if (!result) {
        return null;
      }

      await Models.Product.updateMany(
        { "category._id": toObjectId(category._id) },
        { $set: { "category.name": category.name } }
      );

      return normalize(result);
    }

    const data = readData();
    const index = data.categories.findIndex(function (item) {
      return item._id === category._id;
    });

    if (index === -1) {
      return null;
    }

    data.categories[index] = {
      ...data.categories[index],
      name: category.name
    };

    data.products = data.products.map(function (product) {
      if (product.category && product.category._id === category._id) {
        return {
          ...product,
          category: clone(data.categories[index])
        };
      }

      return product;
    });

    writeData(data);
    return clone(data.categories[index]);
  },
  async delete(id) {
    if (isMongoReady()) {
      const result = await Models.Category.findByIdAndDelete(toObjectId(id)).lean();

      if (!result) {
        return null;
      }

      await Models.Product.deleteMany({ "category._id": toObjectId(id) });
      return normalize(result);
    }

    const data = readData();
    const index = data.categories.findIndex(function (item) {
      return item._id === id;
    });

    if (index === -1) {
      return null;
    }

    const removed = data.categories.splice(index, 1)[0];
    data.products = data.products.filter(function (product) {
      return !product.category || product.category._id !== id;
    });

    writeData(data);
    return clone(removed);
  }
};

module.exports = CategoryDAO;
