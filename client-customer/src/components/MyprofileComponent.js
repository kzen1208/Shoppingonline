import axios from "axios";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";

import MyContext from "../contexts/MyContext";
import getApiErrorMessage from "../utils/apiError";

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
      txtName: "",
      txtPhone: "",
      txtEmail: ""
    };
  }

  componentDidMount() {
    this.syncFromContext();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.context.customer !== prevState.__customerRef) {
      this.syncFromContext();
    }
  }

  syncFromContext() {
    const customer = this.context.customer;
    if (!customer) {
      return;
    }

    this.setState({
      txtUsername: customer.username || "",
      txtPassword: customer.password || "",
      txtName: customer.name || "",
      txtPhone: customer.phone || "",
      txtEmail: customer.email || "",
      __customerRef: customer
    });
  }

  btnUpdateClick = (event) => {
    event.preventDefault();
    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;
    const name = this.state.txtName.trim();
    const phone = this.state.txtPhone.trim();
    const email = this.state.txtEmail.trim();

    if (!username || !password || !name || !phone || !email) {
      alert("Please enter all required fields.");
      return;
    }

    this.apiPutCustomer(this.context.customer._id, {
      username,
      password,
      name,
      phone,
      email
    });
  };

  apiPutCustomer(id, customer) {
    const config = {
      headers: { "x-access-token": this.context.token }
    };

    axios
      .put(`/api/customer/customers/${id}`, customer, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          alert("Profile updated successfully.");
          this.context.setCustomer({
            ...result,
            password: customer.password
          });
        } else {
          alert("Profile update failed.");
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.context.setToken("");
          this.context.setCustomer(null);
          this.props.navigate("/login");
          return;
        }

        alert(getApiErrorMessage(error, "Profile update failed."));
      });
  }

  render() {
    if (this.context.token === "") {
      return <Navigate replace to="/login" />;
    }

    return (
      <div className="align-center">
        <h2 className="text-center">MY PROFILE</h2>
        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>Username</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtUsername}
                    onChange={(e) => this.setState({ txtUsername: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Password</td>
                <td>
                  <input
                    type="password"
                    value={this.state.txtPassword}
                    onChange={(e) => this.setState({ txtPassword: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Full name</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) => this.setState({ txtName: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Phone</td>
                <td>
                  <input
                    type="tel"
                    value={this.state.txtPhone}
                    onChange={(e) => this.setState({ txtPhone: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>
                  <input
                    type="email"
                    value={this.state.txtEmail}
                    onChange={(e) => this.setState({ txtEmail: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  <input
                    type="submit"
                    value="UPDATE"
                    onClick={this.btnUpdateClick}
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

export default Myprofile;
