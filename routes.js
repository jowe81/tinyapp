//routes.js: all HTTP routes are registered here - exports registerRoutes(app)

const helpers = require("./helpers");
const { lg } = require("@jowe81/lg");

const URL_DATABASE = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const registerRoutes = (app) => {

  //Create cookie with username, redirect to URL list
  app.post('/login', (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect('/urls');
  });

  app.post('/logout', (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");
  });

  app.get('/register', (req, res) => {
    const templateVars = { username: req.cookies.username };
    res.render('register', templateVars);
  });

  //Get URL table as JSON
  app.get('/urls.json', (req, res) => {
    res.json(URL_DATABASE);
  });

  //Render a list of all stored URLs
  app.get(['/urls','/'], (req, res) => {
    const templateVars = { urls: URL_DATABASE, username: req.cookies.username };
    res.render('urls_index', templateVars);
  });

  //Generate and store shortURL, then redirect to URL info page
  app.post('/urls', (req, res) => {
    const shortURL = helpers.generateRandomString();
    const longURL = req.body.longURL;
    lg(`Creating new shortURL (${shortURL}) for ${longURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    URL_DATABASE[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  });

  //Render form to create a new shortURL
  app.get('/urls/new', (req, res) => {
    const templateVars = { username: req.cookies.username };
    res.render('urls_new', templateVars);
  });

  //Delete entry, redirect to index
  app.post('/urls/:shortURL/delete', (req, res) => {
    const shortURL = req.params.shortURL;
    lg(`Deleting ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    delete URL_DATABASE[req.params.shortURL];
    res.redirect('/urls');
  });

  //Edit entry
  app.post('/urls/:shortURL/update', (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    lg(`Updating ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    URL_DATABASE[req.params.shortURL] = longURL;
    res.redirect('/urls');
  });

  //Render info page for URL indicated by :shortURL
  app.get('/urls/:shortURL', (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = URL_DATABASE[shortURL];
    if (longURL !== undefined) {
      lg(`Rendering info for ${req.socket.remoteAddress}:${req.socket.remotePort}/${shortURL}`);
      const templateVars = { shortURL, longURL, username: req.cookies.username };
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


};

module.exports = { registerRoutes };