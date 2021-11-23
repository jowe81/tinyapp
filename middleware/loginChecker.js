//loginChecker.js: middleware

const { lg } = require("@jowe81/lg");

const loginChecker = (req, res, next) => {
  lg(`Registering middleware (loginChecker)`, "-lgChk");
  return (req, res, next) => {

    //Init the middleware
    if (typeof req.userID === 'undefined') {
      req.userID = (validateID) => {
        if (validateID) {
          //If a validation function is passed, check if the ID actually exists
          return validateID(req.cookies.user_id) ? req.cookies.user_id : false;
        } else {
          //Without the argument, simply return the user_id cookie
          return req.cookies.user_id;
        }
      };
    }

    next();

  };
};

module.exports = loginChecker;