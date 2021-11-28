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
    const sessionID = helpers.generateSessionID();
    _sessions[sessionID] = {
      logins: [],
      requests: [],
      userID: "",
    };
    return sessionID;
  };

  const _getNoRequests = (sessionID) => {
    return _sessions[sessionID].requests.length;
  };

  const _sessionIDIsValid = (sessionID) => {
    return typeof _sessions[sessionID] === 'object';
  };

  //Return a shortened ID for logging
  const _shortID = (sessionID, length = 12) => sessionID.substr(0, length);

  return (req, res, next) => {

    //Initialize functionality
    if (!req.session) {
      req.session = {

        //Return reference to session object
        getObject: () => _sessions[req.sessionID],

        //Return the userID of the current user (will be an empty string if none logged in)
        getUserID: () => _sessions[req.sessionID].userID,

        //Add userID property to session object and add timestamp to logins array
        registerLogin: (userID) => {
          _sessions[req.sessionID].logins.push(new Date());
          _sessions[req.sessionID].userID = userID;
          lg(`${_shortID(req.sessionID)} Login (${userID})`, logPrefix);
        },

        //Clear userID property on session object
        registerLogout: () => _sessions[req.sessionID].userID = "",

        hasLoggedInBefore: () => _sessions[req.sessionID].logins.length > 0,

        //Log this request
        registerRequest: () => {
          _sessions[req.sessionID].requests.push({ path: req.url, method: req.method });
          lg(`${_shortID(req.sessionID)} ${req.method} ${req.url}`, logPrefix);
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

    //Initialize new session if not in a session yet or an invalid session id has been passed
    if (!(req.cookies.session_id && _sessionIDIsValid(req.cookies.session_id))) {
      const sessionID = _initSessionObject();
      req.sessionID = sessionID;
      res.cookie("session_id", sessionID);
      lg(`${_shortID(req.sessionID)} New session for ${req.socket.remoteAddress}:${req.socket.remotePort}`, logPrefix);
    }

    //Ensure req.sessionID is defined (already so if this is a new session; otherwise assign cookie value)
    req.sessionID = req.sessionID || req.cookies.session_id;

    req.session.registerRequest();
    next();

  };
};

module.exports = sessions;