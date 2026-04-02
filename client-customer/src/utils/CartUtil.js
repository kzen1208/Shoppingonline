const CartUtil = {
  getTotal(mycart) {
    return mycart.reduce(function (total, item) {
      return total + item.product.price * item.quantity;
    }, 0);
  }
};

export default CartUtil;
