//database.js: exports the users and urls objects
const helpers = require("./helpers");
const bcrypt = require("bcrypt");
const constants = require("./constants");
const { lg } = require("@jowe81/lg");

const logPrefix = "DB";

//************** URLS data and methods ******************

//This is where we hold URLs; prepopulate with defaults below
let urls = {
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

const deleteURL = (shortURL) => delete urls[shortURL];

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
let users = {
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

//************** Analytics data and methods ******************

//This is where we hold analytics
let analytics = {
  "/path/to/page": [], //Keep an array of visits for each page
};

//Return page record for path (or undefined)
const getPageRecord = (path) => analytics[path];

//Return array of records of visits from visitorID to path, or [] if none
const getVisits = (path, visitorID) => {
  let visits = [];
  let pageRecord = getPageRecord(path);
  if (pageRecord) {
    //Select all visits associated with visitorID
    visits = pageRecord.filter(val => val.visitorID === visitorID);
  }
  return visits;
};

//No of visits to path from visitorID
const getVisitCount = (path, visitorID) => getVisits(path, visitorID).length;

//Has visitorID visited page with path before?
const hasVisited = (path, visitorID) => getVisitCount(path, visitorID) > 0;

//Return array of IDs for all visitors to path
const getUniqueVisitors = (path) => {
  let visitors = [];
  let pageRecord = getPageRecord(path);
  if (pageRecord) {
    //Loop through visits and collect unique visitorIDs in visitors array
    pageRecord.forEach(val => {
      if (!visitors.includes(val.visitorID)) {
        visitors.push(val.visitorID);
        return true;
      }
    });
  }
  return visitors;
};

//No of unique visitors to page path
const uniqueVisitorsCount = (path) => getUniqueVisitors(path).length;

//Log visit from visitorID to URL-path path
const registerVisit = (path, visitorID) => {

  const initPageRecord = (path) => {
    analytics[path] = [];
  };

  //Return visit object with timestamp and visitorID
  const createVisitRecord = (visitorID) => {
    return {
      time: new Date(),
      visitorID: visitorID,
    };
  };

  //Initialize page record and visits array if this is the first visit to page
  if (!getPageRecord(path)) initPageRecord(path);
  //Append record for this visit
  analytics[path].push(createVisitRecord(visitorID));
};

//Return analytics data for path
const getAnalytics = (path) => {
  const analytics = {
    timeUpdated: new Date(),
    uniqueVisitorsCount: 0,
    totalVisits: 0,
    visits: []
  };

  const pageRecord = getPageRecord(path);
  if (pageRecord) {
    analytics.uniqueVisitorsCount = uniqueVisitorsCount(path);
    analytics.totalVisits = pageRecord.length;
    analytics.visits = pageRecord;
  }
  return analytics;
};



//*********************** Persistence ********************
const fs = require('fs');

//Attempt to persist data to constants.DB_FILE
const persistToFile = (cb) => {
  lg(`Persisting in-memory database to ${constants.DB_FILE}...`, logPrefix);
  fs.writeFile(constants.DB_FILE, JSON.stringify({ urls, users, analytics }), err => {
    if (err) {
      lg(`Error: couldn't persist database to ${constants.DB_FILE}`, logPrefix);
    } else {
      lg(`Persisted database to ${constants.DB_FILE}`, logPrefix);
    }
    if (cb) cb(err);
  });
};

//Attempt to initialize the database with data from constants.DB_FILE
//If this fails, defaults will be used as declared in each section (urls, user, analytics)
const initFromFile = () => {
  return new Promise((resolve) => {
    fs.readFile(constants.DB_FILE, {encoding: 'utf8'}, (err, data) => {
      if (err) {
        lg(`Unable to init db from file - using in-memory defaults`, logPrefix);
      } else {
        let dataFromFile = {};
        lg(`Initializing database from file ${constants.DB_FILE}...`, logPrefix);
        try {
          dataFromFile = JSON.parse(data);
          lg(`Database init complete`, logPrefix);
        } catch (e) {
          lg(`Error: reading database from ${constants.DB_FILE} failed: ${e.message}`, logPrefix);
        }
        //Where present in dataFromFile, replace data for urls, users, analytics
        urls = dataFromFile.urls || urls;
        users = dataFromFile.users || users;
        analytics = dataFromFile.analytics || analytics;
      }
      resolve();
    });
  });
};

module.exports = {
  //URL Database functions
  addURL,
  updateURL,
  deleteURL,
  getURL,
  sortURLs,
  getURLs,
  urlsForUser,

  //Users Database functions
  addUser,
  getUserByID,
  getUserByEmail,
  validateUserCredentials,
  validateUserID,

  //Analytics Database functions
  getPageRecord,
  getVisits,
  getVisitCount,
  hasVisited,
  getUniqueVisitors,
  uniqueVisitorsCount,
  registerVisit,
  getAnalytics,

  //Persistence
  persistToFile,
  initFromFile,
};