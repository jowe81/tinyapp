//sessions.js: middleware

const { lg } = require("@jowe81/lg");
const helpers = require("../helpers");

//Super simple sessions
const sessions = (req, res, next) => {
  lg(`Registering middleware (sessions)`,'-Sessn');

  //Store sessions in this closure
  const _sessions = {};

  return (req, res, next) => {

    if (!req.cookies.session_id) {
      //Not in a session yet; initialize new session
      const sessionID = helpers.generateID();
      res.cookie("session_id", sessionID);
      _sessions[sessionID] = {};
      req.sessionID = sessionID;
      console.log("SESSION INIT", req.sessionID);
    }

    //req.sessionID will already be defined if this is a new session; otherwise assign cookie value
    req.sessionID = req.sessionID || req.cookies.session_id;
    next();

  };
};

module.exports = sessions;