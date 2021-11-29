//input.js: handle user input
const { lg } = require("@jowe81/lg");
const logPrefix = "UI";

let _stdin = undefined;

// Bind inputStream
const setupInput = (inputStream) => {
  lg(`Setting up input module`, logPrefix);
  _stdin = inputStream;
  if (!_stdin.isTTY) {
    lg(`Error: TTY is not available with nodemon`, logPrefix);
  } else {
    _stdin.setRawMode(true);
    _stdin.setEncoding('utf-8');
    _stdin.resume();
  }
};

//Add a listener: calls cb on receiving character(s) (char may be string or array)
const addKeyboardListener = (char, cb) => {
  lg(`Listening for ${char}`, logPrefix);
  _stdin.on('data', data => {
    if (data === char || Array.isArray(char) && char.includes(data)) {
      cb();
    }
  });
};

const onTerminate = (char, cb) => {
  //Listen to the char passed, as well as CTRL+C
  addKeyboardListener([char, "\u0003"],() => {
    cb();
  });
};

setupInput(process.stdin);

module.exports = {
  addKeyboardListener,
  onTerminate,
};
