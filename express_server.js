
const constants = require("./constants");
const { registerRoutes } = require("./routes");

//Setup logging
const { lg, prefix } = require("@jowe81/lg");
prefix.set("Server");
lg(`TinyApp server starting...`);

const express = require("express");
const app = express();

//Setup middleware
const favicon = require('serve-favicon'); //Serve app icon
app.use(favicon(require('path').join(__dirname, 'public', 'favicon.ico')));
app.use(express.static('public')); //Serve static files
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
const sessions = require("./middleware/sessions");
app.use(sessions());
const flash = require("./middleware/flash");
app.use(flash());

//Use EJS templating engine
app.set('view engine','ejs');

//Register all route definitions in routes.js
registerRoutes(app);

app.listen(constants.PORT, () => {
  lg(`Server listening on port ${constants.PORT}`, "App");
});

