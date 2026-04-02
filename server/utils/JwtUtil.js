const jwt = require("jsonwebtoken");

const MyConstants = require("./MyConstants");

function extractToken(req) {
  const headerToken = req.headers["x-access-token"];
  const authHeader = req.headers.authorization;

  if (headerToken) {
    return headerToken;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return authHeader || null;
}

const JwtUtil = {
  genToken(payload = {}) {
    return jwt.sign(payload, MyConstants.JWT_SECRET, {
      expiresIn: MyConstants.JWT_EXPIRES
    });
  },
  checkToken(req, res, next) {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue."
      });
    }

    jwt.verify(token, MyConstants.JWT_SECRET, function (err, decoded) {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Session has expired or token is invalid."
        });
      }

      req.decoded = decoded;
      return next();
    });
  },
  extractToken
};

module.exports = JwtUtil;
