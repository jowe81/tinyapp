//redirectIfUnauthorized.js: routing-middleware
// - redirect to /login if user is not logged in

const database = require("../../database");

const redirectIfUnauthorized = (req, res, next) => {
  if (!database.getUserByID(req.session.getUserID())) {
    return res.redirect("/login");
  }
  next();
};

module.exports = redirectIfUnauthorized;