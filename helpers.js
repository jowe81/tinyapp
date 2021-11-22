//helpers.js: various helper functions

const constants = require("./constants");

const getCharacterRange = (offset, range) => {
  let i;
  let chars = "";
  for (i = offset; i < offset + range; i++) {
    chars += String.fromCharCode(i);
  }
  return chars;
};

const generateRandomCharacter = () => {
  //Assemble all digits, uppercase- and lowercase characters into a single string
  let allChars = getCharacterRange(48,10) + getCharacterRange(65, 26) + getCharacterRange(97, 26);
  //Return random character
  const pos = Math.floor(Math.random() * allChars.length);
  return allChars[pos];
};

const generateRandomString = (length) => {
  const l = 6 || length;
  let str = "";
  for (let i = 0; i < l; i++) {
    str += generateRandomCharacter();
  }
  return str;
};

//Generate random ID with length as specified in ./constants
const generateID = () => {
  return generateRandomString(constants.ID_LENGTH);
};

//Basic email string validity check
const isValidEmail = (email) => {
  return email.trim().length > 0;
};

//Return true if user with email email exists in users
const emailExists = (users, email) => {
  for (const userID in users) {
    if (users[userID].email && users[userID].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = { generateID, isValidEmail, emailExists };