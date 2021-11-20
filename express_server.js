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

const generateRandomString = () => {
  const length = 6;
  let str = "";
  for (let i = 0; i < length; i++) {
    str += generateRandomCharacter();
  }
  return str;
};

const constants = require("./constants");

const URL_DATABASE = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const { lg, prefix } = require("@jowe81/lg");
prefix.set("Server");

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');

//Get URL table as JSON
app.get('/urls.json', (req, res) => {
  res.json(URL_DATABASE);
});

//Render a list of all stored URLs
app.get(['/urls','/'], (req, res) => {
  const templateVars = { urls: URL_DATABASE };
  res.render('urls_index', templateVars);
});

//Generate and store shortURL, then redirect to URL info page
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  lg(`Creating new shortURL (${shortURL}) for ${longURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
  URL_DATABASE[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Render form to create a new shortURL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//Delete entry, redirect to index
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  lg(`Deleting ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
  delete URL_DATABASE[req.params.shortURL];
  res.redirect('/urls');
});

//Render info page for URL indicated by :shortURL
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = URL_DATABASE[shortURL];
  if (longURL !== undefined) {
    lg(`Rendering info for ${req.socket.remoteAddress}:${req.socket.remotePort}/${shortURL}`);
    const templateVars = { shortURL, longURL };
    res.render('urls_show', templateVars);
  } else {
    //Invalid shortURL - redirect to URL list
    lg(`Invalid shortURL from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
    res.redirect(`/urls`);
  }
});


//Redirect from :shortURL to its target
app.get('/u/:shortURL', (req, res) => {
  const longURL = URL_DATABASE[req.params.shortURL];
  if (longURL !== undefined) {
    lg(`Redirecting ${req.socket.remoteAddress}:${req.socket.remotePort} to ${longURL}`);
    res.redirect(longURL);
  } else {
    //Invalid shortURL - redirect to home page
    lg(`Invalid shortURL from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
    res.redirect(`/urls`);
  }
});


app.listen(constants.PORT, () => {
  lg(`Server listening on port ${constants.PORT}`, "App");
});

