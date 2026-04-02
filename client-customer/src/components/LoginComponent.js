import axios from "axios";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";

import MyContext from "../contexts/MyContext";
import getApiErrorMessage from "../utils/apiError";
import withRouter from "../utils/withRouter";

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: ""
    };
  }

  btnLoginClick = (event) => {
    event.preventDefault();
    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;

    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    axios
      .post("/api/customer/login", { username, password })
      .then((res) => {
        const result = res.data;
        if (result.success) {
          this.context.setToken(result.token);
          this.context.setCustomer({
            ...result.customer,
            password
          });
          this.props.navigate("/home");
        } else {
          alert(result.message);
        }
      })
      .catch((error) => {
        alert(getApiErrorMessage(error, "Login failed. Please try again."));
      });
  };

  render() {
    if (this.context.token !== "") {
      return <Navigate replace to="/home" />;
    }

    return (
      <div className="align-valign-center">
        <h2 className="text-center">CUSTOMER LOGIN</h2>
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
                <td />
                <td>
                  <input
                    type="submit"
                    value="LOGIN"
                    onClick={this.btnLoginClick}
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

export default withRouter(Login);
