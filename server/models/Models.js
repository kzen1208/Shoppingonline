const mongoose = require("mongoose");

const objectIdField = {
  type: mongoose.Schema.Types.ObjectId,
  default: function () {
    return new mongoose.Types.ObjectId();
  }
};

const AdminSchema = mongoose.Schema(
  {
    _id: objectIdField,
    username: String,
    password: String
  },
  { versionKey: false }
);

const CategorySchema = mongoose.Schema(
  {
    _id: objectIdField,
    name: String
  },
  { versionKey: false }
);

const CustomerSchema = mongoose.Schema(
  {
    _id: objectIdField,
    username: String,
    password: String,
    name: String,
    phone: String,
    email: String,
    active: Number,
    token: String
  },
  { versionKey: false }
);

const ProductSchema = mongoose.Schema(
  {
    _id: objectIdField,
    name: String,
    price: Number,
    image: String,
    cdate: Number,
    category: CategorySchema
  },
  { versionKey: false }
);

const ItemSchema = mongoose.Schema(
  {
    product: ProductSchema,
    quantity: Number
  },
  { versionKey: false, _id: false }
);

const OrderSchema = mongoose.Schema(
  {
    _id: objectIdField,
    cdate: Number,
    total: Number,
    status: String,
    customer: CustomerSchema,
    items: [ItemSchema]
  },
  { versionKey: false }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Customer =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

module.exports = {
  Admin,
  Category,
  Customer,
  Product,
  Order
};
