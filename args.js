// args.js: parse command line arguments and make them available as key/value pairs

// Get the raw command line arguments
const rawArgs = process.argv.slice(2);

// Object that will hold arguments as key-value pairs
const args = {};

// Every two arguments make up a key/value pair
const processKeyValuePair = (arg1, arg2, argsObject) => {
  //A pair is valid if arg1 is prefixed with a dash and arg2 is non-empty
  if (arg1.substr(0,1) === "-" && arg1.length > 1) {
    let newKey = arg1.substr(1);
    let newValue = arg2;
    if (newValue) {
      argsObject[newKey] = newValue;
    }
  }
};

//Loop through raw arguments to parse key/value pairs
for (let i = 0; i < rawArgs.length; i += 2) {
  processKeyValuePair(rawArgs[i], rawArgs[i + 1], args);
}

module.exports = args;