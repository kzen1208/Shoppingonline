const express = require("express");
const cors = require("cors");

const MongooseUtil = require("./utils/MongooseUtil");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/hello", function (req, res) {
  res.json({ message: "Hello from shoppingonline server" });
});

app.use("/api/admin", require("./api/admin"));
app.use("/api/customer", require("./api/customer"));
app.use(function (err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: err && err.message ? err.message : "Internal server error."
  });
});

async function bootstrap() {
  await MongooseUtil.connect();

  app.listen(port, function () {
    const mode = MongooseUtil.isConnected() ? "MongoDB Atlas" : "local seed";
    console.log(`Server listening on http://localhost:${port} (${mode})`);
  });
}

bootstrap();
