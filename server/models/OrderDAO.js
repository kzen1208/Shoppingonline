const Models = require("./Models");
const { isMongoReady, normalize, toObjectId } = require("../utils/DbUtil");
const { readData, writeData, clone, generateId } = require("../utils/Store");

function sortByCreatedDesc(orders) {
  return orders.slice().sort(function (a, b) {
    return b.cdate - a.cdate;
  });
}

const OrderDAO = {
  async selectAll() {
    if (isMongoReady()) {
      const orders = await Models.Order.find({}).sort({ cdate: -1 }).lean();
      return normalize(orders);
    }

    const data = readData();
    return clone(sortByCreatedDesc(data.orders || []));
  },
  async selectByCustID(customerId) {
    if (isMongoReady()) {
      const orders = await Models.Order.find({
        "customer._id": toObjectId(customerId)
      })
        .sort({ cdate: -1 })
        .lean();
      return normalize(orders);
    }

    const data = readData();
    return clone(
      sortByCreatedDesc(
        (data.orders || []).filter(function (item) {
          return item.customer && item.customer._id === customerId;
        })
      )
    );
  },
  async insert(order) {
    if (isMongoReady()) {
      const result = await Models.Order.create({
        cdate: order.cdate,
        total: order.total,
        status: order.status,
        customer: order.customer,
        items: order.items
      });
      return normalize(result);
    }

    const data = readData();
    const newOrder = {
      _id: generateId(),
      cdate: order.cdate,
      total: order.total,
      status: order.status,
      customer: clone(order.customer),
      items: clone(order.items)
    };

    data.orders.push(newOrder);
    writeData(data);
    return clone(newOrder);
  },
  async update(id, newStatus) {
    if (isMongoReady()) {
      const result = await Models.Order.findByIdAndUpdate(
        toObjectId(id),
        { status: newStatus },
        { new: true }
      ).lean();
      return normalize(result);
    }

    const data = readData();
    const index = data.orders.findIndex(function (item) {
      return item._id === id;
    });

    if (index === -1) {
      return null;
    }

    data.orders[index] = {
      ...data.orders[index],
      status: newStatus
    };

    writeData(data);
    return clone(data.orders[index]);
  }
};

module.exports = OrderDAO;
