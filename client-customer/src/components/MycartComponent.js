import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";
import CartUtil from "../utils/CartUtil";
import withRouter from "../utils/withRouter";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class Mycart extends Component {
  static contextType = MyContext;

  componentDidMount() {
    this.syncCartProducts();
  }

  componentDidUpdate() {
    this.syncCartProducts();
  }

  lnkRemoveClick = (id) => {
    const mycart = [...this.context.mycart];
    const index = mycart.findIndex((item) => item.product._id === id);

    if (index !== -1) {
      mycart.splice(index, 1);
      this.context.setMycart(mycart);
    }
  };

  syncCartProducts() {
    const mycart = this.context.mycart || [];
    const cartKey = mycart
      .map((item) => (item && item.product ? item.product._id : ""))
      .filter(Boolean)
      .join("|");

    if (!cartKey) {
      this.lastCartKey = "";
      return;
    }

    if (cartKey === this.lastCartKey) {
      return;
    }

    this.lastCartKey = cartKey;
    this.apiRefreshCartProducts(mycart);
  }

  apiRefreshCartProducts(mycart) {
    Promise.all(
      mycart.map((item) =>
        axios
          .get(`/api/customer/products/${item.product._id}`)
          .then((res) => res.data)
          .catch(() => null)
      )
    ).then((products) => {
      let hasChanged = false;

      const refreshedCart = mycart.map((item, index) => {
        const latestProduct =
          products[index] && products[index]._id ? products[index] : item.product;

        if (JSON.stringify(latestProduct) !== JSON.stringify(item.product)) {
          hasChanged = true;
        }

        return {
          ...item,
          product: latestProduct
        };
      });

      if (hasChanged) {
        this.context.setMycart(refreshedCart);
      }
    });
  }

  lnkCheckoutClick = () => {
    if (!window.confirm("Are you sure you want to place this order?")) {
      return;
    }

    if (this.context.mycart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!this.context.customer) {
      this.props.navigate("/login");
      return;
    }

    const total = CartUtil.getTotal(this.context.mycart);
    const items = this.context.mycart;
    const customer = this.context.customer;

    this.apiCheckout(total, items, customer);
  };

  apiCheckout(total, items, customer) {
    const body = { total, items, customer };
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios
      .post("/api/customer/checkout", body, config)
      .then((res) => {
        const result = res.data;

        if (result && result._id) {
          alert("Checkout successful.");
          this.context.setMycart([]);
          this.props.navigate("/myorders");
          return;
        }

        alert(result && result.message ? result.message : "Checkout failed.");
      })
      .catch((error) => {
        const message =
          error.response &&
          error.response.data &&
          error.response.data.message
            ? error.response.data.message
            : "Checkout failed.";

        alert(message);

        if (error.response && error.response.status === 401) {
          this.props.navigate("/login");
        }
      });
  }

  render() {
    const mycart = this.context.mycart.map((item, index) => (
      <tr key={item.product._id} className="datatable">
        <td>{index + 1}</td>
        <td>{item.product._id}</td>
        <td>{item.product.name}</td>
        <td>{item.product.category ? item.product.category.name : ""}</td>
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
        <td>
          <span
            className="link"
            onClick={() => this.lnkRemoveClick(item.product._id)}
          >
            Remove
          </span>
        </td>
      </tr>
    ));

    return (
      <div className="align-center">
        <h2 className="text-center">CART ITEMS</h2>
        <table className="datatable" border="1">
          <tbody>
            <tr className="datatable">
              <th>No.</th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Image</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
            {mycart}
            <tr>
              <td colSpan="6" />
              <td>Total</td>
              <td>{CartUtil.getTotal(this.context.mycart)}</td>
              <td>
                <span className="link" onClick={this.lnkCheckoutClick}>
                  CHECKOUT
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(Mycart);
