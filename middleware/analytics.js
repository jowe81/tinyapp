//analytics.js: middleware

const database = require("../database");
const { lg } = require("@jowe81/lg");

const logPrefix = '-Altcs';

//Super simple analytics: register each visit to each path
const analytics = (req, res, next) => {
  lg(`Registering middleware (analytics)`, logPrefix);

  return (req, res, next) => {
    //Register this visit to this path
    lg(`Registering visit to ${req.url} by session ${req.sessionID}`, logPrefix);
    database.registerVisit(req.url, req.sessionID);
    next();
  };

};

module.exports = analytics;