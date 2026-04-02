import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";
import ProductDetail from "./ProductDetailComponent";

function toImageSource(image) {
  if (!image) {
    return "";
  }

  return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
}

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null
    };
  }

  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }

  apiGetProducts(page) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.get(`/api/admin/products?page=${page}`, config).then((res) => {
      const result = res.data;
      this.setState({
        products: result.products,
        noPages: result.noPages,
        curPage: result.curPage
      });
    });
  }

  updateProducts = (products, noPages, curPage) => {
    this.setState({
      products,
      noPages,
      curPage,
      itemSelected: null
    });
  };

  lnkPageClick = (page) => {
    this.apiGetProducts(page);
  };

  trItemClick = (item) => {
    this.setState({ itemSelected: item });
  };

  render() {
    const products = this.state.products.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trItemClick(item)}
      >
        <td>{item._id}</td>
        <td>{item.name}</td>
        <td>{item.price}</td>
        <td>{new Date(item.cdate).toLocaleString()}</td>
        <td>{item.category ? item.category.name : ""}</td>
        <td>
          <img src={toImageSource(item.image)} width="100" height="100" alt="" />
        </td>
      </tr>
    ));

    const pagination = Array.from(
      { length: this.state.noPages },
      (_, index) => index + 1
    ).map((page) => {
      if (page === this.state.curPage) {
        return (
          <span key={page}>
            |<b>{page}</b>|
          </span>
        );
      }

      return (
        <span key={page} className="link" onClick={() => this.lnkPageClick(page)}>
          |{page}|
        </span>
      );
    });

    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">PRODUCT LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Creation Date</th>
                <th>Category</th>
                <th>Image</th>
              </tr>
              {products}
              <tr>
                <td colSpan="6">{pagination}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="inline" />
        <ProductDetail
          item={this.state.itemSelected}
          curPage={this.state.curPage}
          updateProducts={this.updateProducts}
        />
        <div className="float-clear" />
      </div>
    );
  }
}

export default Product;
