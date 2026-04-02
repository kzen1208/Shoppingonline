import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null,
      loadingCustomers: false,
      loadingOrders: false,
      customerMessage: "",
      orderMessage: "",
      selectedCustomerId: ""
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  trCustomerClick = (item) => {
    this.setState({
      selectedCustomerId: item._id,
      orders: [],
      order: null,
      orderMessage: ""
    });
    this.apiGetOrdersByCustID(item._id);
  };

  trOrderClick = (item) => {
    this.setState({ order: item });
  };

  lnkDeactiveClick = (event, item) => {
    event.stopPropagation();

    if (!window.confirm("Deactivate this customer account?")) {
      return;
    }

    this.apiPutCustomerDeactive(item._id, item.token || "");
  };

  lnkEmailClick = (event, item) => {
    event.stopPropagation();
    this.apiGetCustomerSendmail(item._id);
  };

  apiGetCustomers() {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    this.setState({ loadingCustomers: true, customerMessage: "" });

    axios
      .get("/api/admin/customers", config)
      .then((res) => {
        const customers = Array.isArray(res.data) ? res.data : [];
        const selectedCustomerId = this.state.selectedCustomerId;
        const hasSelectedCustomer = customers.some(function (item) {
          return item._id === selectedCustomerId;
        });

        this.setState({
          customers,
          loadingCustomers: false,
          customerMessage: customers.length === 0 ? "No customers found." : "",
          selectedCustomerId: hasSelectedCustomer ? selectedCustomerId : ""
        });
      })
      .catch(() => {
        this.setState({
          customers: [],
          loadingCustomers: false,
          customerMessage: "Cannot load customers."
        });
      });
  }

  apiGetOrdersByCustID(cid) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    this.setState({ loadingOrders: true, orderMessage: "", order: null });

    axios
      .get(`/api/admin/orders/customer/${cid}`, config)
      .then((res) => {
        const orders = Array.isArray(res.data) ? res.data : [];
        this.setState({
          orders,
          order: orders.length > 0 ? orders[0] : null,
          loadingOrders: false,
          orderMessage:
            orders.length === 0 ? "This customer does not have any orders." : ""
        });
      })
      .catch(() => {
        this.setState({
          orders: [],
          order: null,
          loadingOrders: false,
          orderMessage: "Cannot load orders for this customer."
        });
      });
  }

  apiPutCustomerDeactive(id, token) {
    const body = { token };
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios
      .put(`/api/admin/customers/deactive/${id}`, body, config)
      .then((res) => {
        if (res.data) {
          alert("Customer deactivated successfully.");
          this.apiGetCustomers();

          if (this.state.selectedCustomerId === id) {
            this.apiGetOrdersByCustID(id);
          }
        } else {
          alert("Cannot deactivate customer.");
        }
      })
      .catch(() => {
        alert("Cannot deactivate customer.");
      });
  }

  apiGetCustomerSendmail(id) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios
      .get(`/api/admin/customers/sendmail/${id}`, config)
      .then((res) => {
        const result = res.data;
        alert(result && result.message ? result.message : "Email failure.");
      })
      .catch(() => {
        alert("Email failure.");
      });
  }

  render() {
    const customers = this.state.customers.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trCustomerClick(item)}
      >
        <td>{item._id}</td>
        <td>{item.username}</td>
        <td>{item.password}</td>
        <td>{item.name}</td>
        <td>{item.phone}</td>
        <td>{item.email}</td>
        <td>{item.active}</td>
        <td>
          {item.active === 0 ? (
            <span
              className="link"
              onClick={(event) => this.lnkEmailClick(event, item)}
            >
              EMAIL
            </span>
          ) : (
            <span
              className="link"
              onClick={(event) => this.lnkDeactiveClick(event, item)}
            >
              DEACTIVE
            </span>
          )}
        </td>
      </tr>
    ));

    const orders = this.state.orders.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trOrderClick(item)}
      >
        <td>{item._id}</td>
        <td>{new Date(item.cdate).toLocaleString()}</td>
        <td>{item.customer ? item.customer.name : ""}</td>
        <td>{item.customer ? item.customer.phone : ""}</td>
        <td>{item.total}</td>
        <td>{item.status}</td>
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
          <h2 className="text-center">CUSTOMER LIST</h2>
          {this.state.loadingCustomers ? (
            <div>Loading customers...</div>
          ) : this.state.customerMessage ? (
            <div>{this.state.customerMessage}</div>
          ) : (
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
                {customers}
              </tbody>
            </table>
          )}
        </div>
        {this.state.loadingOrders ? (
          <div className="align-center">Loading orders...</div>
        ) : this.state.orderMessage ? (
          <div className="align-center">{this.state.orderMessage}</div>
        ) : this.state.orders.length > 0 ? (
          <div className="align-center">
            <h2 className="text-center">ORDER LIST</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation Date</th>
                  <th>Cust. Name</th>
                  <th>Cust. Phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
                {orders}
              </tbody>
            </table>
          </div>
        ) : (
          <div />
        )}
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

export default Customer;
