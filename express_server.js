
const constants = require("./constants");
const { registerRoutes } = require("./routes");

const { lg, prefix } = require("@jowe81/lg");
prefix.set("Server");

const express = require("express");
const app = express();

//Setup middleware
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

//Use EJS templating engine
app.set('view engine','ejs');

//Register all route definitions in routes.js
registerRoutes(app);

app.listen(constants.PORT, () => {
  lg(`Server listening on port ${constants.PORT}`, "App");
});

