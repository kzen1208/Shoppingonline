import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";
import getApiErrorMessage from "../utils/apiError";
import withRouter from "../utils/withRouter";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      message: "",
      product: null,
      txtQuantity: 1
    };
  }

  componentDidMount() {
    this.apiGetProduct(this.props.params.id);
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.id !== prevProps.params.id) {
      this.apiGetProduct(this.props.params.id);
    }
  }

  apiGetProduct(id) {
    this.setState({ loading: true, message: "", product: null });
    axios
      .get(`/api/customer/products/${id}`)
      .then((res) => {
        this.setState({
          loading: false,
          message: "",
          product: res.data,
          txtQuantity: 1
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          message: getApiErrorMessage(error, "Unable to load product details."),
          product: null,
          txtQuantity: 1
        });
      });
  }

  btnAdd2CartClick = (event) => {
    event.preventDefault();
    const product = this.state.product;
    const quantity = parseInt(this.state.txtQuantity, 10);

    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      alert("Quantity must be between 1 and 99.");
      return;
    }

    const mycart = [...this.context.mycart];
    const index = mycart.findIndex((item) => item.product._id === product._id);

    if (index === -1) {
      mycart.push({ product, quantity });
    } else {
      mycart[index] = {
        ...mycart[index],
        quantity: mycart[index].quantity + quantity
      };
    }

    this.context.setMycart(mycart);
    alert("Added to cart.");
  };

  render() {
    const product = this.state.product;

    if (this.state.loading) {
      return <div className="empty-state">Loading product details...</div>;
    }

    if (this.state.message) {
      return <div className="empty-state">{this.state.message}</div>;
    }

    if (!product) {
      return <div className="empty-state">Product not found.</div>;
    }

    return (
      <div className="align-center product-detail">
        <h2 className="text-center">PRODUCT DETAILS</h2>
        <figure className="caption-right">
          <img
            className="product-detail-image"
            src={toImageSource(product.image)}
            width="400"
            height="400"
            alt={product.name}
          />
          <figcaption>
            <form>
              <table className="product-detail-table">
                <tbody>
                  <tr>
                    <td align="right">Product ID:</td>
                    <td>{product._id}</td>
                  </tr>
                  <tr>
                    <td align="right">Name:</td>
                    <td>{product.name}</td>
                  </tr>
                  <tr>
                    <td align="right">Price:</td>
                    <td>${Number(product.price).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td align="right">Category:</td>
                    <td>{product.category ? product.category.name : ""}</td>
                  </tr>
                  <tr>
                    <td align="right">Created at:</td>
                    <td>{new Date(product.cdate).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td align="right">Status:</td>
                    <td>In stock</td>
                  </tr>
                  <tr>
                    <td align="right">Details:</td>
                    <td>
                      {product.name} belongs to{" "}
                      {product.category ? product.category.name : "product"} and is
                      ready to order.
                    </td>
                  </tr>
                  <tr>
                    <td align="right">Quantity:</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={this.state.txtQuantity}
                        onChange={(e) =>
                          this.setState({ txtQuantity: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td />
                    <td>
                      <input
                        type="submit"
                        value="ADD TO CART"
                        onClick={this.btnAdd2CartClick}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </figcaption>
        </figure>
      </div>
    );
  }
}

export default withRouter(ProductDetail);
