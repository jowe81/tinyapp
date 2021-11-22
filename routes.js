//routes.js: all HTTP routes are registered here - exports registerRoutes(app)

const constants = require("./constants");
const database = require("./database");
const helpers = require("./helpers");
const { lg } = require("@jowe81/lg");


const registerRoutes = (app) => {

  //Process login, redirect to URL list
  app.post('/login', (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect('/urls');
  });

  //Process logout
  app.post('/logout', (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
  });

  //Render user registration form
  app.get('/register', (req, res) => {
    const templateVars = { user:database.users[req.cookies.user_id] };
    res.render('register', templateVars);
  });

  //Register a new user, redirect to /urls
  app.post('/register', (req, res) => {
    if (helpers.isValidEmail(req.body.email) && req.body.password && req.body.password.length > constants.MIN_PASSWORD_LENGTH) {
      //Form data is valid
      if (!helpers.emailExists(database.usersusers, req.body.email)) {
        //Email address is available
        const userID = helpers.generateID();
        database.users[userID] = {
          id: userID,
          email: req.body.email,
          password: req.body.password,
        };
        res.cookie('user_id', userID);
        lg(`Added user ${JSON.stringify(database.users[userID])}`);
        res.redirect('/'); //not using /urls because I couldn't find a way to change the request method to GET for the redirect
      } else {
        //Email exists already
        res.statusCode = 400;
        res.end("Email address already exists\n");
      }
    } else {
      //Invalid email address and/or password too short
      res.statusCode = 400;
      res.end("Invalid email address and/or password too short\n");
    }
  });

  //Get URL table as JSON
  app.get('/urls.json', (req, res) => {
    res.json(database.urls);
  });

  //Render a list of all stored URLs
  app.get(['/urls','/'], (req, res) => {
    const templateVars = { urls: database.urls, user:database.users[req.cookies.user_id] };
    res.render('urls_index', templateVars);
  });

  //Generate and store shortURL, then redirect to URL info page
  app.post('/urls', (req, res) => {
    const shortURL = helpers.generateID();
    const longURL = req.body.longURL;
    lg(`Creating new shortURL (${shortURL}) for ${longURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    database.urls[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  });

  //Render form to create a new shortURL
  app.get('/urls/new', (req, res) => {
    const templateVars = { user:database.users[req.cookies.user_id] };
    res.render('urls_new', templateVars);
  });

  //Delete entry, redirect to index
  app.post('/urls/:shortURL/delete', (req, res) => {
    const shortURL = req.params.shortURL;
    lg(`Deleting ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    delete database.urls[req.params.shortURL];
    res.redirect('/urls');
  });

  //Edit entry
  app.post('/urls/:shortURL/update', (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    lg(`Updating ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    database.urls[req.params.shortURL] = longURL;
    res.redirect('/urls');
  });

  //Render info page for URL indicated by :shortURL
  app.get('/urls/:shortURL', (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = database.urls[shortURL];
    if (longURL !== undefined) {
      lg(`Rendering info for ${req.socket.remoteAddress}:${req.socket.remotePort}/${shortURL}`);
      const templateVars = { shortURL, longURL, user:database.users[req.cookies.user_id] };
      res.render('urls_show', templateVars);
    } else {
      //Invalid shortURL - redirect to URL list
      lg(`Invalid shortURL from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
      res.redirect(`/urls`);
    }
  });


  //Redirect from :shortURL to its target
  app.get('/u/:shortURL', (req, res) => {
    const longURL = database.urls[req.params.shortURL];
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