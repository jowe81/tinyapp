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
  let allChars = getCharacterRange(30,10) + getCharacterRange(65, 26) + getCharacterRange(96, 26);
  //Return random character
  const pos = Math.floor(Math.random() * allChars.length);
  return allChars[pos];
};

const generateRandomString = () => {
  const length = 6;
  let str = "";
  for (let i = 0; i < length; i++) {
    str += generateRandomCharacter();
  }
  return str;
};

const constants = require("./constants");

const { lg } = require("@jowe81/lg");

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');

app.get('/', (req, res) => {
  res.send("Hello");
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls.json', (req, res) => {
  res.json(constants.URL_DATABASE);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: constants.URL_DATABASE };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = constants.URL_DATABASE[shortURL];
  const templateVars = { shortURL, longURL };
  res.render('urls_show', templateVars);
});


app.listen(constants.PORT, () => {
  lg(`Example app listening on port ${constants.PORT}`, "App");
});

