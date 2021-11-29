//analytics.js: middleware

const database = require("../database");
const { lg } = require("@jowe81/lg");

const logPrefix = '-Altcs';

const _pathsToTrack = [];

//True if reqUrl matches any of the paths that we are tracking
const haveMatchingPath = (reqUrl) => {
  for (const path of _pathsToTrack) {
    if (reqUrl.substr(0,path.length) === path) {
      return true;
    }
  }
  return false;
};

//Register a path to track
const addPath = (path) => {
  if (!_pathsToTrack.includes(path)) {
    _pathsToTrack.push(path);
  }
};

//Super simple analytics: register each visit to each path
const analytics = (req, res, next) => {
  lg(`Registering middleware (analytics)`, logPrefix);

  return (req, res, next) => {
    //Register this visit if it is to a path that we are tracking
    if (haveMatchingPath(req.url)) {
      lg(`Registering visit to ${req.url}`, logPrefix);
      database.registerVisit(req.url, req.sessionID);
    }
    next();
  };

};

module.exports = {
  addPath,
  analytics,
};