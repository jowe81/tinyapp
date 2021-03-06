//routes.js: all HTTP routes are registered here - exports registerRoutes(app)

const constants = require("./constants");
const database = require("./database");
const helpers = require("./helpers");
const { lg } = require("@jowe81/lg");

//Middleware to secure protected routes
const redirectIfUnauthorized = require("./middleware/routing/redirectIfUnauthorized");
const sendErrorIfUnauthorized = require("./middleware/routing/sendErrorIfUnauthorized");

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

  //Process login, redirect to /urls on success; back to /login on failure
  app.post('/login', (req, res) => {
    const loggedInUserID = database.validateUserCredentials(req.body.email, req.body.password);
    if (loggedInUserID) {
      lg(`User ${loggedInUserID} (${req.body.email}) logged in`);
      req.session.registerLogin(loggedInUserID);
      return res.redirect('/urls');
    } else {
      lg(`Login attempt for ${req.body.email} failed`);
      req.flash(constants.FLASH_MESSAGES.LOGIN.BAD_CREDENTIALS);
      return res.redirect('/login');
    }
  });

  //Render user registration form
  app.get('/register', (req, res) => {
    req.flash(constants.FLASH_MESSAGES.REGISTER.WELCOME_BEFORE);
    const templateVars = { user:database.getUserByID(req.session.getUserID()), flash: req.flash() };
    res.render('register', templateVars);
  });

  //Register a new user, log them in and redirect to /urls on success; or back to /register
  app.post('/register', (req, res) => {
    if (helpers.isValidEmail(req.body.email) && req.body.password && req.body.password.length >= constants.MIN_PASSWORD_LENGTH) {
      //Form data is valid, attempt creation of new user record
      const newUserID = database.addUser(req.body.email, req.body.password);
      if (newUserID) {
        const user = database.getUserByID(newUserID);
        lg(`User ${newUserID} registered with email ${user.email}`);
        req.flash(constants.FLASH_MESSAGES.REGISTER.WELCOME_AFTER);
        req.session.registerLogin(newUserID);
        return res.redirect('/'); //not using /urls because I couldn't find a way to change the request method to GET for the redirect
      } else {
        //Email exists already
        req.flash(constants.FLASH_MESSAGES.REGISTER.EMAIL_EXISTS);
      }
    } else {
      //Invalid email address and/or password too short
      req.flash(constants.FLASH_MESSAGES.REGISTER.EMAIL_INVALID);
    }
    res.redirect('/register');
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

  //Process logout, redirect to /login
  app.post('/logout', redirectIfUnauthorized, (req, res) => {
    const user = database.getUserByID(req.session.getUserID());
    lg(`User ${user.id} (${user.email}) logged out.`);
    req.session.registerLogout();
    res.redirect("/login");
  });

  //Redirect requests to homepage to login if they're not logged in, to /urls otherwise
  app.get('/', redirectIfUnauthorized, (req, res) => {
    res.redirect('/urls');
  });

  //Render a list of all stored URLs for this user (must be logged in)
  app.get('/urls', sendErrorIfUnauthorized, (req, res) => {
    const urlsForUser = database.urlsForUser(req.session.getUserID());
    const noUrls = Object.keys(urlsForUser).length;
    const templateVars = {
      urls: urlsForUser,
      user: database.getUserByID(req.session.getUserID()),
      flash: req.flash()
    };
    if (!noUrls) {
      req.flash(constants.FLASH_MESSAGES.URL_INDEX.NO_RECORDS);
    }
    res.render('urls_index', templateVars);
  });

  //Generate and store shortURL (must be logged in), then redirect to URL info page
  app.post('/urls', redirectIfUnauthorized, (req, res) => {
    req.flashClear(); //In case there was a message from a previous failed attempt
    if (req.body.longURL) {
      const longURL = helpers.verifyURL(req.body.longURL);
      if (longURL) {
        const shortURL = database.addURL(longURL, req.session.getUserID());
        lg(`User ${req.session.getUserID()} created shortURL ${shortURL} for ${longURL}`);
        req.flash(constants.FLASH_MESSAGES.EDIT_URL.SUCCESS_CREATE);
        res.redirect(`/urls/${shortURL}`);
      } else {
        //User entered invalid URL. Send them back to the form, and include their input so they can adjust it
        req.flash(constants.FLASH_MESSAGES.EDIT_URL.BAD_URL);
        res.redirect(`/urls/new?longURL=${req.body.longURL}`);
      }
    } else {
      //User didn't enter anything
      req.flash(constants.FLASH_MESSAGES.EDIT_URL.NOTHING_ENTERED);
      res.redirect('/urls/new');
    }
  });

  //Render form to create a new shortURL (must be logged in)
  app.get('/urls/new', redirectIfUnauthorized, (req, res) => {
    const templateVars = { user:database.getUserByID(req.session.getUserID()), flash: req.flash() };
    res.render('urls_new', templateVars);
  });

  //Delete entry (must be logged in), redirect to index
  app.delete('/urls/:shortURL/delete', redirectIfUnauthorized, (req, res) => {
    const shortURL = req.params.shortURL;
    lg(`User ${req.session.getUserID()} deleted shortURL ${shortURL}`);
    database.deleteURL(req.params.shortURL);
    res.redirect('/urls');
  });

  //Edit/Update entry (must be logged in)
  app.put('/urls/:shortURL/update', redirectIfUnauthorized, (req, res) => {
    const longURL = helpers.verifyURL(req.body.longURL);
    if (longURL) {
      //Success - updated URL verified
      database.updateURL(req.params.shortURL, longURL);
      lg(`User ${req.session.getUserID()} updated shortURL ${req.params.shortURL} to ${longURL}`);
      req.flash(constants.FLASH_MESSAGES.EDIT_URL.SUCCESS_UPDATE);
      res.redirect(`/urls/${req.params.shortURL}`);
    } else {
      //New URL is invalid - redirect user to try again
      req.flash(constants.FLASH_MESSAGES.EDIT_URL.BAD_URL);
      res.redirect(`/urls/${req.params.shortURL}?edit=true`);
    }
  });

  //Render info/edit page for URL indicated by :shortURL (must be logged in AND own the URL)
  app.get('/urls/:shortURL', sendErrorIfUnauthorized, (req, res) => {
    const shortURL = req.params.shortURL;
    const URLObject = database.getURL(shortURL, req.session.getUserID());
    const templateVars = {
      user: database.getUserByID(req.session.getUserID()),
      flash: req.flash()
    };
    if (URLObject) {
      templateVars.shortURL = shortURL;
      templateVars.URLObject = URLObject;
      templateVars.fullLocalHref = `${req.protocol}://${req.get('host')}/u/${shortURL}`;
      templateVars.analytics = database.getAnalytics(`/u/${shortURL}`);
      res.render('urls_show', templateVars);
    } else {
      //Invalid shortURL or forbidden (user doesn't own the shortURL) - redirect to URL list
      lg(`Invalid shortURL or unauthorized request from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
      templateVars.errorMessage = "Error: You are trying to access an URL that you do not own.";
      res.status(401).render("error", templateVars);
    }
  });

};

module.exports = { registerRoutes };