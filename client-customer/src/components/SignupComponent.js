import axios from "axios";
import React, { Component } from "react";

import getApiErrorMessage from "../utils/apiError";

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
      txtName: "",
      txtPhone: "",
      txtEmail: "",
      activation: null
    };
  }

  btnSignupClick = (event) => {
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

    axios
      .post("/api/customer/signup", { username, password, name, phone, email })
      .then((res) => {
        const result = res.data;
        if (result.success) {
          alert(result.message);
          this.setState({
            txtUsername: "",
            txtPassword: "",
            txtName: "",
            txtPhone: "",
            txtEmail: "",
            activation: result.activation
          });
        } else {
          alert(result.message);
        }
      })
      .catch((error) => {
        alert(getApiErrorMessage(error, "Sign up failed. Please try again."));
      });
  };

  render() {
    return (
      <div className="align-valign-center">
        <h2 className="text-center">SIGN UP</h2>
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
                    type="text"
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
                    value="SIGN UP"
                    onClick={this.btnSignupClick}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        {this.state.activation ? (
          <div>
            <p>Use the following information to activate your account:</p>
            <p>ID: {this.state.activation.id}</p>
            <p>Activation token: {this.state.activation.token}</p>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default Signup;
