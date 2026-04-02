import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";

import getApiErrorMessage from "../utils/apiError";
import withRouter from "../utils/withRouter";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      loading: false,
      products: [],
      message: ""
    };
  }

  componentDidMount() {
    this.apiGetCategories();
    const params = this.props.params;

    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    }
  }

  componentDidUpdate(prevProps) {
    const params = this.props.params;

    if (params.cid && params.cid !== prevProps.params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword && params.keyword !== prevProps.params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    }
  }

  apiGetCategories() {
    axios
      .get("/api/customer/categories")
      .then((res) => {
        this.setState({ categories: res.data });
      })
      .catch(() => {
        this.setState({ categories: [] });
      });
  }

  apiGetProductsByCatID(cid) {
    this.setState({ loading: true, products: [], message: "" });
    axios
      .get(`/api/customer/products/category/${cid}`)
      .then((res) => {
        this.setState({ products: res.data, loading: false, message: "" });
      })
      .catch((error) => {
        this.setState({
          products: [],
          loading: false,
          message: getApiErrorMessage(
            error,
            "Unable to load products for this category."
          )
        });
      });
  }

  apiGetProductsByKeyword(keyword) {
    this.setState({ loading: true, products: [], message: "" });
    axios
      .get(`/api/customer/products/search/${encodeURIComponent(keyword)}`)
      .then((res) => {
        this.setState({ products: res.data, loading: false, message: "" });
      })
      .catch((error) => {
        this.setState({
          products: [],
          loading: false,
          message: getApiErrorMessage(error, "Unable to search products.")
        });
      });
  }

  getTitle() {
    const { cid, keyword } = this.props.params;

    if (keyword) {
      return `SEARCH RESULTS: "${keyword}"`;
    }

    if (cid) {
      const category = this.state.categories.find((item) => item._id === cid);
      return category ? `${category.name.toUpperCase()} PRODUCTS` : "PRODUCTS BY CATEGORY";
    }

    return "PRODUCT LIST";
  }

  getSubtitle() {
    if (this.state.loading) {
      return "Loading products...";
    }

    if (this.state.message) {
      return this.state.message;
    }

    const count = this.state.products.length;
    if (count === 0) {
      return "No matching products found.";
    }

    return `Found ${count} products`;
  }

  render() {
    const products = this.state.products.map((item) => (
      <div key={item._id} className="product-card">
        <figure>
          <Link to={`/product/${item._id}`}>
            <img
              className="product-image"
              src={toImageSource(item.image)}
              width="300"
              height="300"
              alt={item.name}
            />
          </Link>
          <figcaption className="product-meta">
            <strong>{item.name}</strong>
            <span>Category: {item.category ? item.category.name : "N/A"}</span>
            <span>Price: ${Number(item.price).toLocaleString()}</span>
            <span>Added: {new Date(item.cdate).toLocaleDateString()}</span>
          </figcaption>
        </figure>
      </div>
    ));

    return (
      <div className="text-center product-section">
        <h2 className="text-center">{this.getTitle()}</h2>
        <p className="product-summary">{this.getSubtitle()}</p>
        {this.state.products.length > 0 ? (
          <div className="product-grid">{products}</div>
        ) : (
          <div className="empty-state">
            {this.state.loading
              ? "Loading..."
              : this.state.message || "No products to display."}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Product);
