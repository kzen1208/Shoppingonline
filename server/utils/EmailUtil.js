const EmailUtil = {
  async send(email, id, token) {
    const activation = { email, id, token };
    console.log("Activation info:", activation);
    return activation;
  }
};

module.exports = EmailUtil;
