const Models = require("./Models");
const { isMongoReady, normalize, toObjectId } = require("../utils/DbUtil");
const { readData, writeData, clone, generateId } = require("../utils/Store");

function escapeRegex(keyword) {
  return String(keyword || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ProductDAO = {
  async selectAll() {
    if (isMongoReady()) {
      const products = await Models.Product.find({}).sort({ cdate: -1 }).lean();
      return normalize(products);
    }

    const data = readData();
    return clone(data.products);
  },
  async selectByID(id) {
    if (isMongoReady()) {
      const product = await Models.Product.findById(toObjectId(id)).lean();
      return normalize(product);
    }

    const data = readData();
    return clone(
      data.products.find(function (item) {
        return item._id === id;
      })
    );
  },
  async selectByCatID(categoryId) {
    if (isMongoReady()) {
      const products = await Models.Product.find({
        "category._id": toObjectId(categoryId)
      }).lean();
      return normalize(products);
    }

    const data = readData();
    return clone(
      data.products.filter(function (item) {
        return item.category && item.category._id === categoryId;
      })
    );
  },
  async selectByKeyword(keyword) {
    const safeKeyword = escapeRegex(String(keyword || "").trim());

    if (!safeKeyword) {
      return [];
    }

    if (isMongoReady()) {
      const products = await Models.Product.find({
        name: { $regex: safeKeyword, $options: "i" }
      })
        .sort({ cdate: -1 })
        .lean();
      return normalize(products);
    }

    const pattern = new RegExp(safeKeyword, "i");
    const data = readData();
    return clone(
      data.products.filter(function (item) {
        return pattern.test(item.name);
      })
    );
  },
  async selectTopNew(top) {
    if (isMongoReady()) {
      const products = await Models.Product.find({})
        .sort({ cdate: -1 })
        .limit(top)
        .lean();
      return normalize(products);
    }

    const data = readData();
    return clone(
      data.products
        .slice()
        .sort(function (a, b) {
          return b.cdate - a.cdate;
        })
        .slice(0, top)
    );
  },
  async selectTopHot(top) {
    if (isMongoReady()) {
      const hotItems = await Models.Order.aggregate([
        { $match: { status: "APPROVED" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product._id",
            sum: { $sum: "$items.quantity" }
          }
        },
        { $sort: { sum: -1 } },
        { $limit: top }
      ]);

      const productIds = hotItems.map(function (item) {
        return item._id;
      });

      const products = await Models.Product.find({
        _id: { $in: productIds }
      }).lean();

      const productsById = new Map(
        products.map(function (item) {
          return [String(item._id), item];
        })
      );

      return normalize(
        hotItems
          .map(function (item) {
            return productsById.get(String(item._id));
          })
          .filter(Boolean)
      );
    }

    const data = readData();
    const counters = {};

    data.orders
      .filter(function (order) {
        return order.status === "APPROVED";
      })
      .forEach(function (order) {
        order.items.forEach(function (item) {
          const productId = item.product._id;
          counters[productId] = (counters[productId] || 0) + item.quantity;
        });
      });

    return clone(
      Object.keys(counters)
        .sort(function (a, b) {
          return counters[b] - counters[a];
        })
        .slice(0, top)
        .map(function (productId) {
          return data.products.find(function (item) {
            return item._id === productId;
          });
        })
        .filter(Boolean)
    );
  },
  async insert(product) {
    if (isMongoReady()) {
      const result = await Models.Product.create({
        name: product.name,
        price: product.price,
        image: product.image,
        cdate: product.cdate,
        category: product.category
      });
      return normalize(result);
    }

    const data = readData();
    const newProduct = {
      _id: generateId(),
      name: product.name,
      price: product.price,
      image: product.image,
      cdate: product.cdate,
      category: clone(product.category)
    };

    data.products.push(newProduct);
    writeData(data);
    return clone(newProduct);
  },
  async update(product) {
    if (isMongoReady()) {
      const result = await Models.Product.findByIdAndUpdate(
        toObjectId(product._id),
        {
          name: product.name,
          price: product.price,
          image: product.image,
          cdate: product.cdate,
          category: product.category
        },
        { new: true }
      ).lean();
      return normalize(result);
    }

    const data = readData();
    const index = data.products.findIndex(function (item) {
      return item._id === product._id;
    });

    if (index === -1) {
      return null;
    }

    data.products[index] = {
      ...data.products[index],
      name: product.name,
      price: product.price,
      image: product.image,
      cdate: product.cdate,
      category: clone(product.category)
    };

    writeData(data);
    return clone(data.products[index]);
  },
  async delete(id) {
    if (isMongoReady()) {
      const result = await Models.Product.findByIdAndDelete(toObjectId(id)).lean();
      return normalize(result);
    }

    const data = readData();
    const index = data.products.findIndex(function (item) {
      return item._id === id;
    });

    if (index === -1) {
      return null;
    }

    const removed = data.products.splice(index, 1)[0];
    writeData(data);
    return clone(removed);
  }
};

module.exports = ProductDAO;
