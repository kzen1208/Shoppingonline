import axios from "axios";
import React, { Component } from "react";

import getApiErrorMessage from "../utils/apiError";
import withRouter from "../utils/withRouter";

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtToken: ""
    };
  }

  btnActiveClick = (event) => {
    event.preventDefault();
    const id = this.state.txtID.trim();
    const token = this.state.txtToken.trim();

    if (!id || !token) {
      alert("Please enter account ID and activation token.");
      return;
    }

    axios
      .post("/api/customer/active", { id, token })
      .then((res) => {
        const result = res.data;
        if (result.success) {
          alert(result.message);
          this.props.navigate("/login");
        } else {
          alert(result.message);
        }
      })
      .catch((error) => {
        alert(
          getApiErrorMessage(
            error,
            "Account activation failed. Please try again."
          )
        );
      });
  };

  render() {
    return (
      <div className="align-valign-center">
        <h2 className="text-center">ACTIVATE ACCOUNT</h2>
        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
                    onChange={(e) => this.setState({ txtID: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Activation token</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtToken}
                    onChange={(e) => this.setState({ txtToken: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  <input
                    type="submit"
                    value="ACTIVATE"
                    onClick={this.btnActiveClick}
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

export default withRouter(Active);
