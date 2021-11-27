//database.js: exports the users and urls objects
const helpers = require("./helpers");
const bcrypt = require("bcrypt");
const constants = require("./constants");


//************** URLS data and methods ******************

//This is where we hold URLs; prepopulate with defaults below
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

//Return a URL object. If userID is provided, only return if user owns the object.
const getURL = (shortURL, userID) => {
  return !userID || urls[shortURL].userID === userID ? urls[shortURL] : false;
};

//Take the output from getURLs and sort it by longURL
const sortURLs = (urls) => {
  const sortedUrls = {};
  //Put all url objects into an array
  const array = [];
  for (const url in urls) {
    const thisUrl = {};
    thisUrl[url] = urls[url];
    array.push(thisUrl);
  }
  //Order by longURL
  array.sort((a, b) => {
    const keyA = Object.keys(a)[0];
    const keyB = Object.keys(b)[0];
    return a[keyA].longURL > b[keyB].longURL ? 1 : -1;
  });
  //Reconstruct original object in order
  for (const url of array) {
    const key = Object.keys(url)[0];
    sortedUrls[key] = url[Object.keys(url)[0]];
  }
  return sortedUrls;
};

//Return urls owned by user userID, or all urls if not specified
const getURLs = (userID) => {
  const output = {};
  for (const shortURL in urls) {
    if (!userID || urls[shortURL].userID === userID) {
      output[shortURL] = urls[shortURL];
    }
  }
  return sortURLs(output);
};

//Return urls owned by user
const urlsForUser = (userID) => userID ? getURLs(userID) : {};




//************** USERS data and methods ******************

//This is where we hold users; prepopulate with defaults below
const users = {
  "rndmID": {
    id: "rndmID",
    email: "johannes@drweber.de",
    password: "$2b$10$3mrgiWOPKITE57VbmLuJzOgSImSMXLupwtTkIINqDNgP5xNY.Nh8i" // ->"password"
  }
};

//Add new user and return ID or return false if email exists.
const addUser = (email, password) => {
  if (!helpers.emailExists(users, email) && helpers.isValidEmail(email)) {
    const userID = helpers.generateUserID();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, constants.SALT_ROUNDS),
    };
    return userID;
  }
  return false;
};

//Return user object if user with id exists
const getUserByID = (id) => users[id];

//Return user object if user with email exists
const getUserByEmail = (email) => {
  for (const userID in users) {
    if (users[userID].email && users[userID].email === email) {
      return users[userID];
    }
  }
  return undefined;
};

//Return userID if credentials are valid (for Login)
const validateUserCredentials = (email, password) => {
  const user = getUserByEmail(email);
  return user && bcrypt.compareSync(password, user.password) ? user.id : false;
};

//True if record with userID exists
const validateUserID = (userID) => getUserByID(userID) !== undefined;




module.exports = {
  urls,
  addURL,
  updateURL,
  getURL,
  sortURLs,
  getURLs,
  urlsForUser,
  users,
  addUser,
  getUserByID,
  getUserByEmail,
  validateUserCredentials,
  validateUserID,
};