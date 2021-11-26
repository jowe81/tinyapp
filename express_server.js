//express_server.js: TinyApp entry point

const constants = require("./constants");
const args = require("./args");
const { registerRoutes } = require("./routes");

//Setup logging
const { lg, prefix } = require("@jowe81/lg");
prefix.set("Server");
lg(`TinyApp server starting...`);

const express = require("express");
const app = express();

//Setup middleware
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

//Get port from command line or fall back to constants.js
const port = args.port > 0 ? args.port : constants.PORT;

app.listen(port, () => {
  lg(`Server listening on port ${port}`, "App");
});

