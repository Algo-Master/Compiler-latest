const jwt = require("jsonwebtoken");

const authenticate = (token) => {
  try {
    jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] });
    return 1;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return 2;
    }
    return 0;
  }
};

module.exports = { authenticate };
