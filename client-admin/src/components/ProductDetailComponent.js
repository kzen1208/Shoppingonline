import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";

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
      categories: [],
      txtID: "",
      txtName: "",
      txtPrice: 0,
      cmbCategory: "",
      imgProduct: ""
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({
          txtID: this.props.item._id,
          txtName: this.props.item.name,
          txtPrice: this.props.item.price,
          cmbCategory: this.props.item.category ? this.props.item.category._id : "",
          imgProduct: toImageSource(this.props.item.image)
        });
      } else {
        this.setState({
          txtID: "",
          txtName: "",
          txtPrice: 0,
          cmbCategory: "",
          imgProduct: ""
        });
      }
    }
  }

  previewImage = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setState({ imgProduct: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  btnAddClick = (event) => {
    event.preventDefault();
    const name = this.state.txtName.trim();
    const price = Number(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct;

    if (!name || !Number.isFinite(price) || !category || !image) {
      alert("Please enter product name, price, category, and image.");
      return;
    }

    this.apiPostProduct({ name, price, category, image });
  };

  btnUpdateClick = (event) => {
    event.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName.trim();
    const price = Number(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct;

    if (!id || !name || !Number.isFinite(price) || !category || !image) {
      alert("Please enter product ID, name, price, category, and image.");
      return;
    }

    this.apiPutProduct(id, { name, price, category, image });
  };

  btnDeleteClick = (event) => {
    event.preventDefault();

    if (!window.confirm("ARE YOU SURE?")) {
      return;
    }

    if (!this.state.txtID) {
      alert("Please enter a product ID.");
      return;
    }

    this.apiDeleteProduct(this.state.txtID);
  };

  apiGetCategories() {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.get("/api/admin/categories", config).then((res) => {
      const categories = res.data;
      this.setState((prevState) => ({
        categories,
        cmbCategory:
          prevState.cmbCategory || (categories[0] ? categories[0]._id : "")
      }));
    });
  }

  apiGetProducts(page) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.get(`/api/admin/products?page=${page}`, config).then((res) => {
      const result = res.data;

      if (result.products.length === 0 && page > 1) {
        this.apiGetProducts(page - 1);
        return;
      }

      this.props.updateProducts(result.products, result.noPages, result.curPage);
      this.setState({
        txtID: "",
        txtName: "",
        txtPrice: 0,
        cmbCategory: this.state.categories[0] ? this.state.categories[0]._id : "",
        imgProduct: ""
      });
    });
  }

  apiPostProduct(product) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.post("/api/admin/products", product, config).then((res) => {
      if (res.data) {
        alert("Product created successfully.");
        this.apiGetProducts(this.props.curPage);
      } else {
        alert("Unable to create product.");
      }
    });
  }

  apiPutProduct(id, product) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.put(`/api/admin/products/${id}`, product, config).then((res) => {
      if (res.data) {
        alert("Product updated successfully.");
        this.apiGetProducts(this.props.curPage);
      } else {
        alert("Unable to update product.");
      }
    });
  }

  apiDeleteProduct(id) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.delete(`/api/admin/products/${id}`, config).then((res) => {
      if (res.data) {
        alert("Product deleted successfully.");
        this.apiGetProducts(this.props.curPage);
      } else {
        alert("Unable to delete product.");
      }
    });
  }

  render() {
    const categories = this.state.categories.map((category) => (
      <option key={category._id} value={category._id}>
        {category.name}
      </option>
    ));

    return (
      <div className="float-right">
        <h2 className="text-center">PRODUCT DETAIL</h2>
        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input type="text" value={this.state.txtID} readOnly />
                </td>
              </tr>
              <tr>
                <td>Name</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) => this.setState({ txtName: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Price</td>
                <td>
                  <input
                    type="number"
                    value={this.state.txtPrice}
                    onChange={(e) => this.setState({ txtPrice: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Image</td>
                <td>
                  <input
                    type="file"
                    name="fileImage"
                    accept="image/jpeg,image/png,image/gif,image/svg+xml"
                    onChange={this.previewImage}
                  />
                </td>
              </tr>
              <tr>
                <td>Category</td>
                <td>
                  <select
                    value={this.state.cmbCategory}
                    onChange={(e) => this.setState({ cmbCategory: e.target.value })}
                  >
                    {categories}
                  </select>
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  <input
                    type="submit"
                    value="ADD NEW"
                    onClick={this.btnAddClick}
                  />
                  <input
                    type="submit"
                    value="UPDATE"
                    onClick={this.btnUpdateClick}
                  />
                  <input
                    type="submit"
                    value="DELETE"
                    onClick={this.btnDeleteClick}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  {this.state.imgProduct ? (
                    <img src={this.state.imgProduct} width="300" height="300" alt="" />
                  ) : (
                    <div />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}

export default ProductDetail;
