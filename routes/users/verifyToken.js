const jwt = require("jsonwebtoken");
const { ACCESS_DENIED, INVALID_AUTH_TOKEN } = require("../../constants/errors/authError");

module.exports = function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ message: ACCESS_DENIED, errorCode: 401 });

  try {
    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send({ message: INVALID_AUTH_TOKEN, errorCode: 400 });
  }
};
