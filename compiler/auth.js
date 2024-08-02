const jwt = require("jsonwebtoken");

const authenticate = (token) => {
  try {
    jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] });
    console.log("Authentication successful!!");
    return 1;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.log("Token expired...");
      return 2;
    }
    console.log("Token has been tampered with");
    return 0;
  }
};

module.exports = { authenticate };
