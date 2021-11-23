//flash.js: middleware

const { lg } = require("@jowe81/lg");

//Super simple flash messages
const flash = (req, res, next) => {
  lg(`Registering middleware (flash)`,'-Flash');
  return (req, res, next) => {

    //Store flash messages in this closure
    const _messages = [];

    //If already initialized, call the next function
    if (req.flash) {
      return next();
    }

    //Init the middleware.
    //Pass a message to add it. Omit the argument to retrieve the messages array
    if (!req.flash) {
      req.flash = (message) => {
        if (message) {
          _messages.push(message);
        } else {
          return _messages;
        }
      };
      return next();
    }
    
  };
};

module.exports = flash;