import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";

import getApiErrorMessage from "../utils/apiError";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newprods: [],
      hotprods: [],
      message: ""
    };
  }

  componentDidMount() {
    this.apiGetNewProducts();
    this.apiGetHotProducts();
  }

  apiGetNewProducts() {
    axios
      .get("/api/customer/products/new")
      .then((res) => {
        this.setState({ newprods: res.data, message: "" });
      })
      .catch((error) => {
        this.setState({
          newprods: [],
          message: getApiErrorMessage(error, "Unable to load new products.")
        });
      });
  }

  apiGetHotProducts() {
    axios
      .get("/api/customer/products/hot")
      .then((res) => {
        this.setState({ hotprods: res.data, message: "" });
      })
      .catch((error) => {
        this.setState({
          hotprods: [],
          message: getApiErrorMessage(error, "Unable to load hot products.")
        });
      });
  }

  render() {
    const newprods = this.state.newprods.map((item) => (
      <div key={item._id} className="inline">
        <figure>
          <Link to={`/product/${item._id}`}>
            <img src={toImageSource(item.image)} width="300" height="300" alt="" />
          </Link>
          <figcaption className="text-center">
            {item.name}
            <br />
            Price: ${Number(item.price).toLocaleString()}
          </figcaption>
        </figure>
      </div>
    ));

    const hotprods = this.state.hotprods.map((item) => (
      <div key={item._id} className="inline">
        <figure>
          <Link to={`/product/${item._id}`}>
            <img src={toImageSource(item.image)} width="300" height="300" alt="" />
          </Link>
          <figcaption className="text-center">
            {item.name}
            <br />
            Price: ${Number(item.price).toLocaleString()}
          </figcaption>
        </figure>
      </div>
    ));

    return (
      <div>
        {this.state.message ? (
          <div className="empty-state">{this.state.message}</div>
        ) : (
          <div />
        )}
        <div className="align-center">
          <h2 className="text-center">NEW PRODUCTS</h2>
          {newprods}
        </div>
        {this.state.hotprods.length > 0 ? (
          <div className="align-center">
            <h2 className="text-center">HOT PRODUCTS</h2>
            {hotprods}
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default Home;
