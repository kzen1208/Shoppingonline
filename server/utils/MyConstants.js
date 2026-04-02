const MyConstants = {
  DB_SERVER: process.env.DB_SERVER || "<cluster>.mongodb.net",
  DB_USER: process.env.DB_USER || "<db_user>",
  DB_PASS: process.env.DB_PASS || "<db_pass>",
  DB_DATABASE: process.env.DB_DATABASE || "shoppingonline",
  EMAIL_USER: process.env.EMAIL_USER || "<email_user>",
  EMAIL_PASS: process.env.EMAIL_PASS || "<email_pass>",
  JWT_SECRET: process.env.JWT_SECRET || "shoppingonline-secret",
  JWT_EXPIRES: process.env.JWT_EXPIRES || "7d"
};

module.exports = MyConstants;
