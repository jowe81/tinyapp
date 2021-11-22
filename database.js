//database.js: exports the users and urls objects
const helpers = require("./helpers");

const urls = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "rndmID": {
    id: "rndmID",
    email: "johannes@drweber.de",
    password: "password"
  }
};

//Add new user and return ID or return false if email exists.
const addUser = (email, password) => {
  if (!helpers.emailExists(email)) {
    const userID = helpers.generateID();
    users[userID] = {
      id: userID,
      email: email,
      password: password,
    };
    return userID;
  }
  return false;
};

module.exports = { urls, users, addUser };