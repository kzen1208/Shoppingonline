import axios from "axios";
import React, { Component } from "react";

import MyContext from "../contexts/MyContext";
import CategoryDetail from "./CategoryDetailComponent";

class Category extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories() {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios.get("/api/admin/categories", config).then((res) => {
      this.setState({ categories: res.data });
    });
  }

  updateCategories = (categories) => {
    this.setState({
      categories,
      itemSelected: null
    });
  };

  trItemClick = (item) => {
    this.setState({ itemSelected: item });
  };

  render() {
    const categories = this.state.categories.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trItemClick(item)}
      >
        <td>{item._id}</td>
        <td>{item.name}</td>
      </tr>
    ));

    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">CATEGORY LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
              </tr>
              {categories}
            </tbody>
          </table>
        </div>
        <div className="inline" />
        <CategoryDetail
          item={this.state.itemSelected}
          updateCategories={this.updateCategories}
        />
        <div className="float-clear" />
      </div>
    );
  }
}

export default Category;
