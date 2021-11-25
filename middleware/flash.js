//flash.js: middleware

const { lg } = require("@jowe81/lg");

//Super simple flash messages
const flash = (req, res, next) => {
  lg(`Registering middleware (flash)`,'-Flash');

  //Store flash messages in this closure - use sessionID as key
  const _messages = {};

  //Initialize messages for this session if needed
  const _ensureInit = (sessionID) => {
    if (!Array.isArray(_messages[sessionID])) {
      _messages[sessionID] = [];
    }
  };

  return (req, res, next) => {

    //Init the middleware.
    if (!req.flash) {

      //Delete message with index or all messages when no valid index present
      req.flashClear = (index) => {
        _ensureInit(req.sessionID);
        if (index >= 0  && index < _messages[req.sessionID].length) {
          _messages[req.sessionID].splice(index, 1);
        } else {
          _messages[req.sessionID] = [];
        }
      };

      //Pass a message to add it. Omit the arguments to retrieve the messages array
      req.flash = (message, type = 'alert-primary') => {
        _ensureInit(req.sessionID);
        if (message) {
          //Add message to this sessions' messages array
          _messages[req.sessionID].push({ message, type });
        } else {
          //Return messages for this sesion
          return _messages[req.sessionID];
        }
      };

    }

    //Delete old messages if previous request was a GET request
    if (req.session.getPreviousRequest().method === "GET") {
      req.flashClear();
    }

    return next();

  };
};

module.exports = flash;