const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const MongooseUtil = require("./utils/MongooseUtil");
const { ensureClientBuilds } = require("./scripts/ensureClientBuilds");

const app = express();
const port = process.env.PORT || 3000;
const adminBuildPath = path.resolve(__dirname, "../client-admin/build");
const customerBuildPath = path.resolve(__dirname, "../client-customer/build");
const adminIndexPath = path.join(adminBuildPath, "index.html");
const customerIndexPath = path.join(customerBuildPath, "index.html");

function sendBuildInstructions(res) {
  return res.status(503).type("html").send(
    [
      "<h1>Frontend build not found</h1>",
      "<p>Run the project from the repository root so Replit can install dependencies and build the two React apps automatically.</p>",
      "<pre>npm start</pre>",
      "<p>If you are starting the server manually, build these folders first:</p>",
      "<pre>client-admin/build\nclient-customer/build</pre>"
    ].join("")
  );
}

function registerFrontendRoutes() {
  if (fs.existsSync(adminIndexPath)) {
    app.use("/admin", express.static(adminBuildPath));
    app.get("/admin/*", function (req, res) {
      res.sendFile(adminIndexPath);
    });
  } else {
    app.get("/admin", function (req, res) {
      return sendBuildInstructions(res);
    });

    app.get("/admin/*", function (req, res) {
      return sendBuildInstructions(res);
    });
  }

  if (fs.existsSync(customerIndexPath)) {
    app.use("/", express.static(customerBuildPath));
    app.get("*", function (req, res, next) {
      if (req.path.startsWith("/api/")) {
        return next();
      }

      return res.sendFile(customerIndexPath);
    });
  } else {
    app.get("*", function (req, res, next) {
      if (req.path.startsWith("/api/")) {
        return next();
      }

      return sendBuildInstructions(res);
    });
  }
}

function registerErrorHandler() {
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
}

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/hello", function (req, res) {
  res.json({ message: "Hello from shoppingonline server" });
});

app.use("/api/admin", require("./api/admin"));
app.use("/api/customer", require("./api/customer"));

async function bootstrap() {
  await MongooseUtil.connect();
  ensureClientBuilds();
  registerFrontendRoutes();
  registerErrorHandler();

  app.listen(port, function () {
    const mode = MongooseUtil.isConnected() ? "MongoDB Atlas" : "local seed";
    console.log(`Server listening on http://localhost:${port} (${mode})`);
  });
}

bootstrap();
