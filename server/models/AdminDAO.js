const Models = require("./Models");
const { isMongoReady, normalize } = require("../utils/DbUtil");
const { readData, clone } = require("../utils/Store");

const AdminDAO = {
  async selectByUsernameAndPassword(username, password) {
    if (isMongoReady()) {
      const admin = await Models.Admin.findOne({ username, password }).lean();
      return normalize(admin);
    }

    const data = readData();
    return clone(
      data.admins.find(function (item) {
        return item.username === username && item.password === password;
      })
    );
  }
};

module.exports = AdminDAO;
