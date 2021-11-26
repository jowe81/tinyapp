//routes.js: all HTTP routes are registered here - exports registerRoutes(app)

const constants = require("./constants");
const database = require("./database");
const helpers = require("./helpers");
const { lg } = require("@jowe81/lg");

const redirectIfUnauthorized = (req, res, next) => {
  //Routing-middleware: redirect to /login if not authorized
  if (!database.getUserByID(req.session.getUserID())) {
    return res.redirect("/login");
  }
  next();
};


const registerRoutes = (app) => {

  app.get('/login', (req, res) => {
    const previousRequestURL = req.session.getPreviousRequest().path;
    let msg;
    if (previousRequestURL === "/logout") {
      //User (session) just logged out
      msg =  constants.FLASH_MESSAGES.LOGIN.GOODBYE;
    } else if (previousRequestURL && req.session.hasLoggedInBefore()) {
      //User (session) had previously logged in
      msg = constants.FLASH_MESSAGES.LOGIN.WELCOME_BACK;
    } else {
      //New session - visiting login for the first time
      msg = constants.FLASH_MESSAGES.LOGIN.WELCOME;
    }
    req.flash(msg);
    const templateVars = { flash: req.flash() };
    res.render('login', templateVars);
  });

  //Process login, redirect to /urls
  app.post('/login', (req, res) => {
    const loggedInUserID = database.validateUserCredentials(req.body.email, req.body.password);
    if (loggedInUserID) {
      lg(`User ${loggedInUserID} (${req.body.email}) logged in`);
      //res.cookie("user_id", loggedInUserID);
      req.session.registerLogin(loggedInUserID);
    } else {
      lg(`Login attempt for ${req.body.email} failed`, "UI");
      res.statusCode = 403;
      return res.end(`Invalid or Missing Credentials`);
    }
    res.redirect('/urls');
  });

  //Process logout, redirect to /login
  app.post('/logout', (req, res) => {
    //res.clearCookie("user_id");
    req.session.registerLogout();
    res.redirect("/login");
  });

  //Render user registration form
  app.get('/register', (req, res) => {
    const templateVars = { user:database.users[req.session.getUserID()] };
    res.render('register', templateVars);
  });

  //Register a new user, redirect to /urls
  app.post('/register', (req, res) => {
    if (helpers.isValidEmail(req.body.email) && req.body.password && req.body.password.length >= constants.MIN_PASSWORD_LENGTH) {
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


  //***** Routes below require the user to be logged in ****************************************

  //Render a list of all stored URLs for this user (must be logged in)
  app.get(['/urls','/'], redirectIfUnauthorized, (req, res) => {
    const urlsForUser = database.urlsForUser(req.session.getUserID());
    const noUrls = Object.keys(urlsForUser).length;
    const templateVars = { urls: urlsForUser, user:database.users[req.session.getUserID()], flash: req.flash() };
    if (!noUrls) {
      req.flash(constants.FLASH_MESSAGES.URL_INDEX.NO_RECORDS);
    }
    lg(`Rendering list with ${noUrls} URLs for ${database.getUserByID(req.session.getUserID()).email}`);
    res.render('urls_index', templateVars);
  });

  //Generate and store shortURL (must be logged in), then redirect to URL info page
  app.post('/urls', redirectIfUnauthorized, (req, res) => {
    req.flashClear(); //In case there was a message from a previous failed attempt
    if (req.body.longURL) {
      const longURL = helpers.verifyURL(req.body.longURL);
      if (longURL) {
        const shortURL = database.addURL(longURL, req.session.getUserID());
        lg(`User ${database.getUserByID(req.session.getUserID()).email} created shortURL ${shortURL} for ${longURL}`);
        res.redirect(`/urls/${shortURL}`);
      } else {
        //User entered invalid URL. Send them back to the form, and include their input so they can adjust it
        req.flash(constants.FLASH_MESSAGES.NEW_URL.BAD_URL, 'alert-warning');
        res.redirect(`/urls/new?longURL=${req.body.longURL}`);
      }
    } else {
      //User didn't enter anything
      req.flash(constants.FLASH_MESSAGES.NEW_URL.NOTHING_ENTERED, 'alert-warning');
      res.redirect('/urls/new');
    }
  });

  //Render form to create a new shortURL (must be logged in)
  app.get('/urls/new', redirectIfUnauthorized, (req, res) => {
    const templateVars = { user:database.users[req.session.getUserID()], flash: req.flash() };
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
    const longURL = helpers.verifyURL(req.body.longURL);
    if (longURL) {
      //Success - updated URL verified
      database.updateURL(req.params.shortURL, longURL);
      res.redirect('/urls');
    } else {
      //New URL is invalid - redirect user to try again
      req.flash(constants.FLASH_MESSAGES.NEW_URL.BAD_URL);
      res.redirect(`/urls/${req.params.shortURL}?edit=true`);
    }
  });

  //Render info page for URL indicated by :shortURL (must be logged in AND own the URL)
  app.get('/urls/:shortURL', redirectIfUnauthorized, (req, res) => {
    const shortURL = req.params.shortURL;
    const URLObject = database.getURL(shortURL, req.session.getUserID());
    if (URLObject) {
      lg(`Rendering info for ${req.socket.remoteAddress}:${req.socket.remotePort}/${shortURL}`);
      const templateVars = { shortURL, URLObject, user:database.users[req.session.getUserID()], flash: req.flash() };
      res.render('urls_show', templateVars);
    } else {
      //Invalid shortURL - redirect to URL list
      lg(`Invalid shortURL from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
      res.redirect(`/urls`);
    }
  });

};

module.exports = { registerRoutes };