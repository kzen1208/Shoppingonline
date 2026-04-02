import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null,
      loading: false,
      message: ""
    };
  }

  componentDidMount() {
    this.apiGetOrders();
  }

  trItemClick = (item) => {
    this.setState({ order: item });
  };

  lnkApproveClick = (event, id) => {
    event.stopPropagation();
    this.apiPutOrderStatus(id, "APPROVED");
  };

  lnkCancelClick = (event, id) => {
    event.stopPropagation();
    this.apiPutOrderStatus(id, "CANCELED");
  };

  apiGetOrders(selectedOrderId) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    this.setState({ loading: true, message: "" });

    axios
      .get("/api/admin/orders", config)
      .then((res) => {
        const orders = Array.isArray(res.data) ? res.data : [];
        const order =
          orders.find(function (item) {
            return item._id === selectedOrderId;
          }) || (orders.length > 0 ? orders[0] : null);

        this.setState({
          orders,
          order,
          loading: false,
          message: orders.length === 0 ? "No orders found." : ""
        });
      })
      .catch(() => {
        this.setState({
          orders: [],
          order: null,
          loading: false,
          message: "Cannot load orders."
        });
      });
  }

  apiPutOrderStatus(id, status) {
    const body = { status };
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios
      .put(`/api/admin/orders/status/${id}`, body, config)
      .then((res) => {
        if (res.data) {
          this.apiGetOrders(id);
        } else {
          alert("Cannot update order status.");
        }
      })
      .catch(() => {
        alert("Cannot update order status.");
      });
  }

  render() {
    const orders = this.state.orders.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trItemClick(item)}
      >
        <td>{item._id}</td>
        <td>{new Date(item.cdate).toLocaleString()}</td>
        <td>{item.customer ? item.customer.name : ""}</td>
        <td>{item.customer ? item.customer.phone : ""}</td>
        <td>{item.total}</td>
        <td>{item.status}</td>
        <td>
          {item.status === "PENDING" ? (
            <div>
              <span
                className="link"
                onClick={(event) => this.lnkApproveClick(event, item._id)}
              >
                APPROVE
              </span>{" "}
              |{" "}
              <span
                className="link"
                onClick={(event) => this.lnkCancelClick(event, item._id)}
              >
                CANCEL
              </span>
            </div>
          ) : (
            <div />
          )}
        </td>
      </tr>
    ));

    const items = this.state.order
      ? this.state.order.items.map((item, index) => (
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
            <div>Loading orders...</div>
          ) : this.state.message ? (
            <div>{this.state.message}</div>
          ) : (
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation Date</th>
                  <th>Cust. Name</th>
                  <th>Cust. Phone</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
                {orders}
              </tbody>
            </table>
          )}
        </div>
        {this.state.order ? (
          <div className="align-center">
            <h2 className="text-center">ORDER DETAIL</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>No.</th>
                  <th>Prod. ID</th>
                  <th>Prod. Name</th>
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

export default Order;
