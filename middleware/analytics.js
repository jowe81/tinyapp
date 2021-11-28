//analytics.js: middleware

const database = require("../database");

//Super simple analytics: register each visit to each path
const analytics = (req, res, next) => {

  return (req, res, next) => {
    
    //Init the middleware
    if (!req.analytics) {

      req.analytics = {

        registerVisit: () => {
          database.registerVisit(req.url, req.cookies.sessionID);
        }

      };

    }

    //Register this visit to this path
    req.analytics.registerVisit();
    next();
  };

};

module.exports = analytics;