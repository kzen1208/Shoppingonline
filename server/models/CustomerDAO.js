const Models = require("./Models");
const CryptoUtil = require("../utils/CryptoUtil");
const { isMongoReady, normalize, toObjectId } = require("../utils/DbUtil");
const {
  readData,
  writeData,
  clone,
  generateId,
  sanitizeCustomer
} = require("../utils/Store");

const CustomerDAO = {
  async selectAll() {
    if (isMongoReady()) {
      const customers = await Models.Customer.find({}).lean();
      return normalize(customers);
    }

    const data = readData();
    return clone(data.customers || []);
  },
  async selectByUsernameOrEmail(username, email) {
    if (isMongoReady()) {
      const customer = await Models.Customer.findOne({
        $or: [{ username }, { email }]
      }).lean();
      return normalize(customer);
    }

    const data = readData();
    return clone(
      data.customers.find(function (item) {
        return item.username === username || item.email === email;
      })
    );
  },
  async selectByUsername(username) {
    if (isMongoReady()) {
      const customer = await Models.Customer.findOne({ username }).lean();
      return normalize(customer);
    }

    const data = readData();
    return clone(
      data.customers.find(function (item) {
        return item.username === username;
      })
    );
  },
  async selectByEmail(email) {
    if (isMongoReady()) {
      const customer = await Models.Customer.findOne({ email }).lean();
      return normalize(customer);
    }

    const data = readData();
    return clone(
      data.customers.find(function (item) {
        return item.email === email;
      })
    );
  },
  async selectByID(id) {
    if (isMongoReady()) {
      const customer = await Models.Customer.findById(toObjectId(id)).lean();
      return normalize(customer);
    }

    const data = readData();
    return clone(
      data.customers.find(function (item) {
        return item._id === id;
      })
    );
  },
  async selectByUsernameAndPassword(username, password) {
    if (isMongoReady()) {
      const customer = await Models.Customer.findOne({ username, password }).lean();
      return normalize(customer);
    }

    const data = readData();
    return clone(
      data.customers.find(function (item) {
        return item.username === username && item.password === password;
      })
    );
  },
  async insert(customer) {
    if (isMongoReady()) {
      const result = await Models.Customer.create({
        username: customer.username,
        password: customer.password,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        active: customer.active,
        token: customer.token
      });
      return sanitizeCustomer(normalize(result));
    }

    const data = readData();
    const newCustomer = {
      _id: generateId(),
      username: customer.username,
      password: customer.password,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      active: customer.active,
      token: customer.token
    };

    data.customers.push(newCustomer);
    writeData(data);
    return sanitizeCustomer(newCustomer);
  },
  async activate(id, token) {
    if (isMongoReady()) {
      const customer = await Models.Customer.findOneAndUpdate(
        { _id: toObjectId(id), token },
        { active: 1, token: "" },
        { new: true }
      ).lean();
      return sanitizeCustomer(normalize(customer));
    }

    const data = readData();
    const index = data.customers.findIndex(function (item) {
      return item._id === id && item.token === token;
    });

    if (index === -1) {
      return null;
    }

    data.customers[index].active = 1;
    data.customers[index].token = "";
    writeData(data);
    return sanitizeCustomer(data.customers[index]);
  },
  async active(id, token, active) {
    if (isMongoReady()) {
      const currentToken = String(token || "");
      const nextToken =
        active === 1 ? "" : currentToken || CryptoUtil.randomToken();

      const customer = await Models.Customer.findOneAndUpdate(
        { _id: toObjectId(id), token: currentToken },
        { active, token: nextToken },
        { new: true }
      ).lean();
      return sanitizeCustomer(normalize(customer));
    }

    const data = readData();
    const currentToken = String(token || "");
    const index = data.customers.findIndex(function (item) {
      return item._id === id && item.token === currentToken;
    });

    if (index === -1) {
      return null;
    }

    data.customers[index].active = active;
    if (active === 1) {
      data.customers[index].token = "";
    } else if (!data.customers[index].token) {
      data.customers[index].token = CryptoUtil.randomToken();
    }
    writeData(data);
    return sanitizeCustomer(data.customers[index]);
  },
  async update(customer) {
    if (isMongoReady()) {
      const result = await Models.Customer.findByIdAndUpdate(
        toObjectId(customer._id),
        {
          username: customer.username,
          password: customer.password,
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        },
        { new: true }
      ).lean();
      return sanitizeCustomer(normalize(result));
    }

    const data = readData();
    const index = data.customers.findIndex(function (item) {
      return item._id === customer._id;
    });

    if (index === -1) {
      return null;
    }

    data.customers[index] = {
      ...data.customers[index],
      username: customer.username,
      password: customer.password,
      name: customer.name,
      phone: customer.phone,
      email: customer.email
    };

    writeData(data);
    return sanitizeCustomer(data.customers[index]);
  }
};

module.exports = CustomerDAO;
