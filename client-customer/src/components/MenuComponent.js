import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";

import withRouter from "../utils/withRouter";

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: ""
    };
  }

  componentDidMount() {
    this.apiGetCategories();
    this.syncKeywordFromRoute();
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.syncKeywordFromRoute();
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

  syncKeywordFromRoute() {
    const keyword = this.props.params.keyword || "";

    if (keyword !== this.state.txtKeyword) {
      this.setState({ txtKeyword: keyword });
    }
  }

  btnSearchClick = (event) => {
    event.preventDefault();
    const keyword = this.state.txtKeyword.trim();

    if (!keyword) {
      this.props.navigate("/home");
      return;
    }

    this.props.navigate(`/product/search/${encodeURIComponent(keyword)}`);
  };

  render() {
    const categories = this.state.categories.map((item) => (
      <li key={item._id} className="menu">
        <Link to={`/product/category/${item._id}`}>{item.name}</Link>
      </li>
    ));

    return (
      <div className="border-bottom">
        <div className="float-left">
          <ul className="menu">
            <li className="menu">
              <Link to="/home">Home</Link>
            </li>
            {categories}
          </ul>
        </div>
        <div className="float-right">
          <form className="search" onSubmit={this.btnSearchClick}>
            <input
              type="search"
              className="keyword"
              placeholder="Enter keyword"
              value={this.state.txtKeyword}
              onChange={(e) => this.setState({ txtKeyword: e.target.value })}
            />
            <input
              type="submit"
              value="SEARCH"
              onClick={this.btnSearchClick}
            />
          </form>
        </div>
        <div className="float-clear" />
      </div>
    );
  }
}

export default withRouter(Menu);
