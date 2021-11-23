//loginChecker.js: middleware

const { lg } = require("@jowe81/lg");

const loginChecker = (req, res, next) => {
  lg(`Registering middleware (loginChecker)`, "-lgChk");
  return (req, res, next) => {
    if (typeof req.userID === 'undefined') {
      req.userID = (users) => {
        return req.cookies.user_id;
      }
    }
    next();
  }
};

module.exports = loginChecker;