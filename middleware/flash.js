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

    //If middleware is already initialized, nothing to do
    if (req.flash) {
      return next();
    }

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

      //Pass a message to add it. Omit the argument to retrieve the messages array
      req.flash = (message) => {
        _ensureInit(req.sessionID);
        if (message) {
          //Add message to this sessions' messages array
          _messages[req.sessionID].push(message);
        } else {
          //Return messages for this sesion
          return _messages[req.sessionID];
        }
      };

      return next();
    }

  };
};

module.exports = flash;