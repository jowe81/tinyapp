//database.js: exports the users and urls objects
const helpers = require("./helpers");

const urls = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "rndmID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "rndmID" },
};

const addURL = (longURL, userID) => {
  const shortURL = helpers.generateID();
  urls[shortURL] = { longURL: longURL, userID: userID };
  return shortURL;
};

const updateURL = (shortURL, longURL) => {
  urls[shortURL].longURL = longURL;
};

//Return urls owned by user userID, or all urls not specified
const getURLs = (userID) => {
  const output = {};
  for (const shortURL in urls) {
    if (!userID || urls[shortURL].userID === userID) {
      output[shortURL] = urls[shortURL];
    }
  }
  return output;
};

//Return urls owned by user
const urlsForUser = (userID) => getURLs(userID);






const users = {
  "rndmID": {
    id: "rndmID",
    email: "johannes@drweber.de",
    password: "password"
  }
};

//Add new user and return ID or return false if email exists.
const addUser = (email, password) => {
  if (!helpers.emailExists(users, email)) {
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

//Return user object if user with id exists
const getUserByID = (id) => {
  for (const userID in users) {
    if (userID === id) {
      return users[userID];
    }
  }
  return false;
};

//Return user object if user with email exists
const getUserByEmail = (email) => {
  for (const userID in users) {
    if (users[userID].email && users[userID].email === email) {
      return users[userID];
    }
  }
  return false;
};

//Return userID if credentials are valid (for Login)
const validateUserCredentials = (email, password) => {
  const user = getUserByEmail(email);
  return user && user.password === password ? user.id : false;
};


module.exports = {
  urls,
  addURL,
  updateURL,
  getURLs,
  urlsForUser,
  users,
  addUser,
  getUserByID,
  getUserByEmail,
  validateUserCredentials
};