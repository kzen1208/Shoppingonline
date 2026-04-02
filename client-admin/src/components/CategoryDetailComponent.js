import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";

class CategoryDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtName: ""
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({
          txtID: this.props.item._id,
          txtName: this.props.item.name
        });
      } else {
        this.setState({
          txtID: "",
          txtName: ""
        });
      }
    }
  }

  btnAddClick = (event) => {
    event.preventDefault();
    const name = this.state.txtName.trim();

    if (!name) {
      alert("Please enter a category name.");
      return;
    }

    this.apiPostCategory({ name });
  };

  btnUpdateClick = (event) => {
    event.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName.trim();

    if (!id || !name) {
      alert("Please enter both category ID and name.");
      return;
    }

    this.apiPutCategory(id, { name });
  };

  btnDeleteClick = (event) => {
    event.preventDefault();

    if (!window.confirm("ARE YOU SURE?")) {
      return;
    }

    const id = this.state.txtID;
    if (!id) {
      alert("Please enter a category ID.");
      return;
    }

    this.apiDeleteCategory(id);
  };

  apiGetCategories() {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.get("/api/admin/categories", config).then((res) => {
      this.props.updateCategories(res.data);
      this.setState({
        txtID: "",
        txtName: ""
      });
    });
  }

  apiPostCategory(category) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.post("/api/admin/categories", category, config).then((res) => {
      if (res.data) {
        alert("Category created successfully.");
        this.apiGetCategories();
      } else {
        alert("Unable to create category.");
      }
    });
  }

  apiPutCategory(id, category) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.put(`/api/admin/categories/${id}`, category, config).then((res) => {
      if (res.data) {
        alert("Category updated successfully.");
        this.apiGetCategories();
      } else {
        alert("Unable to update category.");
      }
    });
  }

  apiDeleteCategory(id) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.delete(`/api/admin/categories/${id}`, config).then((res) => {
      if (res.data) {
        alert("Category deleted successfully.");
        this.apiGetCategories();
      } else {
        alert("Unable to delete category.");
      }
    });
  }

  render() {
    return (
      <div className="float-right">
        <h2 className="text-center">CATEGORY DETAIL</h2>
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
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}

export default CategoryDetail;
