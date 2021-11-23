//sessions.js: middleware

const { lg } = require("@jowe81/lg");
const helpers = require("../helpers");

const logPrefix = '-Sessn';

//Super simple sessions
const sessions = (req, res, next) => {
  lg(`Registering middleware (sessions)`, logPrefix);

  //Store sessions in this closure
  const _sessions = {};

  const _initSessionObject = () => {
    const sessionID = helpers.generateID();
    _sessions[sessionID] = {
      logins: [],
    };
    return sessionID;
  };

  return (req, res, next) => {

    //Initialize functionality
    if (!req.session) {
      req.session = {

        //Return reference to session object
        getObject: () => _sessions[req.sessionID],

        //Add timestamp to login info
        registerLogin: () => {
          _sessions[req.sessionID].logins.push(new Date());
          lg(`[${req.sessionID}]: Login`, logPrefix);
        },

      };
    }

    //Initialize new session if not in a session yet
    if (!req.cookies.session_id) {
      const sessionID = _initSessionObject();
      req.sessionID = sessionID;
      res.cookie("session_id", sessionID);
      lg(`[${sessionID}] New session for ${req.socket.remoteAddress}:${req.socket.remotePort}`, logPrefix);
    }

    //Ensure req.sessionID is defined (already so if this is a new session; otherwise assign cookie value)
    req.sessionID = req.sessionID || req.cookies.session_id;
    next();

  };
};

module.exports = sessions;