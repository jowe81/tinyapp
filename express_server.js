const constants = require("./constants");

const { lg } = require("@jowe81/lg");

const express = require("express");
const app = express();

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

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = constants.URL_DATABASE[shortURL];
  const templateVars = { shortURL, longURL };
  res.render('urls_show', templateVars);
});

app.listen(constants.PORT, () => {
  lg(`Example app listening on port ${constants.PORT}`, "App");
});

