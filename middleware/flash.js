//flash.js: middleware

//Super simple flash messages
const flash = (req, res, next) => {
  console.log("Init middleware");

  return (req, res, next) => {
    console.log("First flash request");

    const messages = [];

    //If already initialized, call the next function
    if (req.flash) {
      return next();
    }
    //Init the middleware.
    //Pass a message to add it. Omit the argument to retrieve the messages array
    if (!req.flash) {
      req.flash = (message) => {
        if (message) {
          messages.push(message);
        } else {
          return messages;
        }
      };
      return next();
    }
  };
};

module.exports = flash;