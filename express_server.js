//express_server.js: TinyApp entry point

const constants = require("./constants");
const args = require("./args");
const { registerRoutes } = require("./routes");

//Init database
const database = require("./database");
database.initFromFile();

const input = require("./input");
input.onTerminate('q', () => {
  lg(`Shutting down`);
  database.persistToFile(() => {
    lg(`Thanks for using TinyApp - Goodbye!`);
    process.exit();
  });
});

//Setup logging
const { lg, prefix } = require("@jowe81/lg");
prefix.set("Server");
lg(`TinyApp server starting...`);

const express = require("express");
const app = express();

//Setup middleware
app.use(express.static('public')); //Serve static files
const methodOverride = require('method-override');
app.use(methodOverride('_method')); //Support PUT/DELETE for forms
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
const sessions = require("./middleware/sessions");
app.use(sessions());
const analytics = require("./middleware/analytics");
app.use(analytics());
const flash = require("./middleware/flash");
app.use(flash());

//Use EJS templating engine
app.set('view engine','ejs');

//Register all route definitions in routes.js
registerRoutes(app);

//Get port from command line or fall back to constants.js
const port = args.port > 0 ? args.port : constants.PORT;

app.listen(port, () => {
  lg(`Listening on port ${port}`);
});