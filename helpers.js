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

const generateID = () => {
  return generateRandomString(constants.ID_LENGTH);
};

const isValidEmail = (email) => {
  //Make sure it's non-empty. Can improve later.
  return email.trim().length > 0;
};

module.exports = { generateID, isValidEmail };