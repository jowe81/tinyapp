//routes.js: all HTTP routes are registered here - exports registerRoutes(app)

const constants = require("./constants");
const database = require("./database");
const helpers = require("./helpers");
const { lg } = require("@jowe81/lg");

const redirectIfUnauthorized = (req, res, next) => {
  //Routing-middleware: redirect to /login if not authorized
  if (!database.getUserByID(req.cookies.user_id)) {
    return res.redirect("/login");
  }
  next();
};


const registerRoutes = (app) => {

  app.get('/login', (req, res) => {
    res.render('login');
  });

  //Process login, redirect to /urls
  app.post('/login', (req, res) => {
    const loggedInUserID = database.validateUserCredentials(req.body.email, req.body.password);
    if (loggedInUserID) {
      lg(`User ${loggedInUserID} (${req.body.email}) logged in`);
      res.cookie("user_id", loggedInUserID);
    } else {
      lg(`Login attempt for ${req.body.email} failed`, "UI");
      res.statusCode = 403;
      return res.end(`Invalid or Missing Credentials`);
    }
    res.redirect('/urls');
  });

  //Process logout, redirect to /urls
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
      //Form data is valid, attempt creation of new user record
      const newUserID = database.addUser(req.body.email, req.body.password);
      if (newUserID) {
        res.cookie('user_id', newUserID);
        lg(`Added user ${JSON.stringify(database.users[newUserID])}`);
        res.redirect('/'); //not using /urls because I couldn't find a way to change the request method to GET for the redirect
      } else {
        //Email exists already
        lg(`Attempt to add new user failed`);
        res.statusCode = 400;
        res.end("Email address already exists\n");
      }
    } else {
      //Invalid email address and/or password too short
      res.statusCode = 400;
      res.end("Invalid email address and/or password too short\n");
    }
  });

  //Redirect from :shortURL to its target
  app.get('/u/:shortURL', (req, res) => {
    const URLObject = database.getURL(req.params.shortURL);
    if (URLObject) {
      lg(`Redirecting ${req.socket.remoteAddress}:${req.socket.remotePort} to ${URLObject.longURL}`);
      res.redirect(URLObject.longURL);
    } else {
      //Invalid shortURL - redirect to home page
      lg(`Invalid shortURL from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
      res.redirect(`/urls`);
    }
  });

  //Render a list of all stored URLs for currently logged-in user, or suggest to register/login
  app.get(['/urls','/'], (req, res) => {
    const urlsForUser = database.urlsForUser(req.userID());
    const noUrls = Object.keys(urlsForUser).length;
    const templateVars = { urls: urlsForUser, user:database.users[req.cookies.user_id], flash: req.flash() };
    if (req.userID(database.validateUserID)) {
      lg(`Rendering list with ${noUrls} URLs for ${database.getUserByID(req.cookies.user_id).email}`);
    } else {
      lg(`Asking user to register /login`);
      req.flash('Looks empty here, eh? Well, you need to log in to view and store URLs. Please register or login.');
    }
    res.render('urls_index', templateVars);
  });



  //***** Routes below require the user to be logged in ****************************************

  //Generate and store shortURL (must be logged in), then redirect to URL info page
  app.post('/urls', redirectIfUnauthorized, (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = database.addURL(longURL, req.cookies.user_id);
    lg(`User ${database.getUserByID(req.cookies.user_id).email} created shortURL ${shortURL} for ${longURL}`);
    res.redirect(`/urls/${shortURL}`);
  });

  //Render form to create a new shortURL (must be logged in)
  app.get('/urls/new', redirectIfUnauthorized, (req, res) => {
    const templateVars = { user:database.users[req.cookies.user_id] };
    res.render('urls_new', templateVars);
  });

  //Delete entry (must be logged in), redirect to index
  app.post('/urls/:shortURL/delete', redirectIfUnauthorized, (req, res) => {
    const shortURL = req.params.shortURL;
    lg(`Deleting ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    delete database.urls[req.params.shortURL];
    res.redirect('/urls');
  });

  //Edit/Update entry (must be logged in)
  app.post('/urls/:shortURL/update', redirectIfUnauthorized, (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    lg(`Updating ${shortURL} (requested by ${req.socket.remoteAddress}:${req.socket.remotePort})`);
    database.updateURL(req.params.shortURL, longURL);
    res.redirect('/urls');
  });

  //Render info page for URL indicated by :shortURL (must be logged in AND own the URL)
  app.get('/urls/:shortURL', redirectIfUnauthorized, (req, res) => {
    const shortURL = req.params.shortURL;
    const URLObject = database.getURL(shortURL, req.cookies.user_id);
    if (URLObject) {
      lg(`Rendering info for ${req.socket.remoteAddress}:${req.socket.remotePort}/${shortURL}`);
      const templateVars = { shortURL, URLObject, user:database.users[req.cookies.user_id] };
      res.render('urls_show', templateVars);
    } else {
      //Invalid shortURL - redirect to URL list
      lg(`Invalid shortURL from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
      res.redirect(`/urls`);
    }
  });

};

module.exports = { registerRoutes };