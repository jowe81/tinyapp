//sendErrorIfUnauthorized.js: routing-middleware
// - send 401 error if user is not logged in

const { lg } = require("@jowe81/lg");
const logPrefix = "-Er401";

const database = require("../../database");

const sendErrorIfUnauthorized = (req, res, next) => {
  if (!database.getUserByID(req.session.getUserID())) {
    lg(`Sending 401 error in response to unauthorized request to protected route`, logPrefix);
    return res.status(401).render("error", { errorMessage: `Error: You must be <a href="/login">logged in</a> to access this page.` });
  }
  next();
};

module.exports = sendErrorIfUnauthorized;