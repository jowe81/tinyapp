//routes.js: all HTTP routes are registered here - exports registerRoutes(app)

const helpers = require("./helpers");
const { lg } = require("@jowe81/lg");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "rndmID": {
    id: "rndmID",
    email: "johannes@drweber.de",
    password: "password"
  }
};

const registerRoutes = (app) => {

  //Process login, redirect to URL list
  app.post('/login', (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect('/urls');
  });

  //Process logout
  app.post('/logout', (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");
  });

  //Render user registration form
  app.get('/register', (req, res) => {
    const templateVars = { userID:users[req.cookies.user_id] };
    res.render('register', templateVars);
  });

  //Register a new user, redirect to /urls
  app.post('/register', (req, res) => {
    const userID = helpers.generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password,
    };
    lg(`Added user ${JSON.stringify(users[userID])}`)
    res.redirect('/'); //not using /urls because I couldn't find a way to change the request method to GET for the redirect
  });

  //Get URL table as JSON
  app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
  });

  //Render a list of all stored URLs
  app.get(['/urls','/'], (req, res) => {
    const templateVars = { urls: urlDatabase, userID:users[req.cookies.user_id] };
    res.render('urls_index', templateVars);
  });

  //Generate and store shortURL, then redirect to URL info page
  app.post('/urls', (req, res) => {
    const shortURL = helpers.generateRandomString();
    const longURL = req.body.longURL;
    lg(`Creating new shortURL (${shortURL}) for ${longURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  });

  //Render form to create a new shortURL
  app.get('/urls/new', (req, res) => {
    const templateVars = { userID:users[req.cookies.user_id] };
    res.render('urls_new', templateVars);
  });

  //Delete entry, redirect to index
  app.post('/urls/:shortURL/delete', (req, res) => {
    const shortURL = req.params.shortURL;
    lg(`Deleting ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  });

  //Edit entry
  app.post('/urls/:shortURL/update', (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    lg(`Updating ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    urlDatabase[req.params.shortURL] = longURL;
    res.redirect('/urls');
  });

  //Render info page for URL indicated by :shortURL
  app.get('/urls/:shortURL', (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    if (longURL !== undefined) {
      lg(`Rendering info for ${req.socket.remoteAddress}:${req.socket.remotePort}/${shortURL}`);
      const templateVars = { shortURL, longURL, userID:users[req.cookies.user_id] };
      res.render('urls_show', templateVars);
    } else {
      //Invalid shortURL - redirect to URL list
      lg(`Invalid shortURL from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
      res.redirect(`/urls`);
    }
  });


  //Redirect from :shortURL to its target
  app.get('/u/:shortURL', (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
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