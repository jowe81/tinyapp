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

      //Pass a message (string) or message object {message, type} to add it.
      //Omit the arguments to retrieve the array of message objects
      req.flash = (message, type = 'alert-primary') => {
        _ensureInit(req.sessionID);
        if (message) {
          //Construct object in case message was passed as a string
          const msgObj = ((message, type) => typeof message === 'object' ? message : { message, type })(message, type);
          _messages[req.sessionID].push(msgObj);
        } else {
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