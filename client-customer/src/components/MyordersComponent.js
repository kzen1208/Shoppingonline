import axios from "axios";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";

import MyContext from "../contexts/MyContext";
import CartUtil from "../utils/CartUtil";
import withRouter from "../utils/withRouter";

const DRAFT_ORDER_ID = "__cart_preview__";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null,
      loading: false,
      message: ""
    };
    this.lastRequestKey = "";
  }

  componentDidMount() {
    this.syncOrders();
  }

  componentDidUpdate() {
    this.syncOrders();
  }

  trItemClick = (item) => {
    this.setState({ order: item });
  };

  getDraftOrder() {
    const customer = this.context.customer;
    const mycart = this.context.mycart || [];

    if (!customer || mycart.length === 0) {
      return null;
    }

    return {
      _id: DRAFT_ORDER_ID,
      cdate: Date.now(),
      customer,
      total: CartUtil.getTotal(mycart),
      status: "IN CART",
      items: mycart.map((item) => ({
        ...item,
        product: item.product
      }))
    };
  }

  syncOrders() {
    const customerId = this.context.customer ? this.context.customer._id : "";
    const token = this.context.token || "";
    const requestKey = customerId && token ? `${customerId}:${token}` : "";

    if (requestKey === this.lastRequestKey) {
      return;
    }

    this.lastRequestKey = requestKey;

    if (!requestKey) {
      if (this.state.orders.length > 0 || this.state.order || this.state.message) {
        this.setState({
          orders: [],
          order: null,
          loading: false,
          message: ""
        });
      }
      return;
    }

    this.apiGetOrdersByCustID(customerId);
  }

  apiGetOrdersByCustID(customerId) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    this.setState({ loading: true, message: "" });

    axios
      .get(`/api/customer/orders/customer/${customerId}`, config)
      .then((res) => {
        const result = res.data;

        if (!Array.isArray(result)) {
          this.setState({
            orders: [],
            order: null,
            loading: false,
            message:
              result && result.message
                ? result.message
                : "Unable to load order list."
          });
          return;
        }

        this.setState((prevState) => {
          const selectedOrder =
            prevState.order &&
            result.find((item) => item._id === prevState.order._id);

          return {
            orders: result,
            order: selectedOrder || (result.length > 0 ? result[0] : null),
            loading: false,
            message: ""
          };
        });
      })
      .catch((error) => {
        const message =
          error.response &&
          error.response.data &&
          error.response.data.message
            ? error.response.data.message
            : "Unable to load order list.";

        if (error.response && error.response.status === 401) {
          this.props.navigate("/login");
          return;
        }

        this.setState({
          orders: [],
          order: null,
          loading: false,
          message
        });
      });
  }

  render() {
    if (this.context.token === "") {
      return <Navigate replace to="/login" />;
    }

    const draftOrder = this.getDraftOrder();
    const displayedOrders = draftOrder
      ? [draftOrder, ...this.state.orders]
      : this.state.orders;
    const selectedOrder = this.state.order
      ? this.state.order._id === DRAFT_ORDER_ID
        ? draftOrder
        : this.state.order
      : draftOrder || (this.state.orders.length > 0 ? this.state.orders[0] : null);

    const orders = displayedOrders.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trItemClick(item)}
      >
        <td>{item._id === DRAFT_ORDER_ID ? "CURRENT_CART" : item._id}</td>
        <td>
          {item._id === DRAFT_ORDER_ID
            ? "Current cart"
            : new Date(item.cdate).toLocaleString()}
        </td>
        <td>{item.customer ? item.customer.name : ""}</td>
        <td>{item.customer ? item.customer.phone : ""}</td>
        <td>{item.total}</td>
        <td>
          {item.status === "PENDING"
            ? "Processing"
            : item.status === "IN CART"
              ? "In cart"
              : item.status}
        </td>
      </tr>
    ));

    const items = selectedOrder
      ? selectedOrder.items.map((item, index) => (
          <tr key={item.product._id} className="datatable">
            <td>{index + 1}</td>
            <td>{item.product._id}</td>
            <td>{item.product.name}</td>
            <td>
              <img
                src={toImageSource(item.product.image)}
                width="70"
                height="70"
                alt=""
              />
            </td>
            <td>{item.product.price}</td>
            <td>{item.quantity}</td>
            <td>{item.product.price * item.quantity}</td>
          </tr>
        ))
      : [];

    return (
      <div>
        <div className="align-center">
          <h2 className="text-center">ORDER LIST</h2>
          {this.state.loading ? (
            <div className="empty-state">Loading order list...</div>
          ) : this.state.message ? (
            <div className="empty-state">{this.state.message}</div>
          ) : displayedOrders.length === 0 ? (
            <div className="empty-state">You do not have any orders yet.</div>
          ) : (
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>Order ID</th>
                <th>Created At</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
              {orders}
            </tbody>
          </table>
          )}
        </div>
        {selectedOrder ? (
          <div className="align-center">
            <h2 className="text-center">ORDER DETAILS</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>No.</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
                {items}
              </tbody>
            </table>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default withRouter(Myorders);
