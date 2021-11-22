//loginChecker.js: middleware
const database = require("./database");

//If user isn't logged in, redirect to /login
const loginChecker = (req, res, next) => {
  if (!database.getUserByID(req.cookies.user_id)) {
    return res.redirect("/login");
  }
  next();
};

module.exports = loginChecker;