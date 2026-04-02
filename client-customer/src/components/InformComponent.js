import React, { Component } from "react";
import { Link } from "react-router-dom";

import MyContext from "../contexts/MyContext";

class Inform extends Component {
  static contextType = MyContext;

  lnkLogoutClick = (event) => {
    event.preventDefault();
    this.context.setToken("");
    this.context.setCustomer(null);
    this.context.setMycart([]);
  };

  render() {
    const customer = this.context.customer;

    return (
      <div className="border-bottom">
        <div className="float-left">
          {customer ? (
            <div>
              Hello <b>{customer.name}</b> | <Link to="/myprofile">Myprofile</Link> |{" "}
              <Link to="/myorders">Myorders</Link> |{" "}
              <Link to="/home" onClick={this.lnkLogoutClick}>
                Logout
              </Link>
            </div>
          ) : (
            <div>
              <Link to="/login">Login</Link> | <Link to="/signup">Sign up</Link> |{" "}
              <Link to="/active">Active</Link>
            </div>
          )}
        </div>
        <div className="float-right">
          <Link to="/mycart">Mycart</Link> have <b>{this.context.mycart.length}</b>{" "}
          items
        </div>
        <div className="float-clear" />
      </div>
    );
  }
}

export default Inform;
