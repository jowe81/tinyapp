//redirectIfUnauthorized.js: routing-middleware
// - redirect to /login if user is not logged in

const { lg } = require("@jowe81/lg");
const logPrefix = "-Redir";

const database = require("../../database");

const redirectIfUnauthorized = (req, res, next) => {
  if (!database.getUserByID(req.session.getUserID())) {
    lg(`Redirecting unauthorized request to protected page to /login`, logPrefix);
    return res.redirect("/login");
  }
  next();
};

module.exports = redirectIfUnauthorized;