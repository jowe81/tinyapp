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
      requests: [],
    };
    return sessionID;
  };

  const _getNoRequests = (sessionID) => {
    return _sessions[sessionID].requests.length;
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

        hasLoggedInBefore: () => _sessions[req.sessionID].logins.length > 0,

        //Log this request
        registerRequest: () => {
          _sessions[req.sessionID].requests.push({ path: req.url, method: req.method });
          lg(`[${req.sessionID}]: ${req.method} request to ${req.url}`, logPrefix);
        },
        
        //Return entire requests array
        getRequestsArray: () => _sessions[req.sessionID].requests,

        //Return URL of previous request
        getPreviousRequest: () => {
          //Previous request is the one less than the highest index (which would be the current request)
          //- If there's no previous request, return current request
          return _sessions[req.sessionID].requests[_getNoRequests(req.sessionID) - 2] || _sessions[req.sessionID].requests[0];
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

    req.session.registerRequest();
    next();

  };
};

module.exports = sessions;