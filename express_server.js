//express_server.js: TinyApp entry point

//***** Init logging ***************************************
const { lg, prefix } = require("@jowe81/lg");
prefix.set("Server");
lg(`TinyApp server starting...`);

//****** Init constants and database defaults **************
const constants = require("./constants");
const database = require("./database");

//****** ExpressJS setup ***********************************
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
const sessions = require("./middleware/sessions"); //My own basic sessions
app.use(sessions());
const analytics = require("./middleware/analytics"); //My own basic analytics
analytics.addPath("/u/"); //Only track visits of short urls, not the whole app
app.use(analytics.analytics());
const flash = require("./middleware/flash"); //My own basic flash messages
app.use(flash());

//Use EJS templating engine
app.set('view engine','ejs');

//Register all route definitions in routes.js
const { registerRoutes } = require("./routes");
registerRoutes(app);

//****** Keyboard listeners for shutdown commands **********
const input = require("./input");

//A little helper to keep this section DRY...
const exit = () => {
  lg(`Thanks for using TinyApp - Goodbye!`);
  process.exit();
};

//Catch termination requests (q/CTRL+C)
input.onTerminate('q', () => {
  if (constants.PERSIST_TO_FILE) {
    database.persistToFile().catch(() => {
      lg(`Unable to save database to file - quitting anyway...`);
    }).finally(exit);
  } else exit();
});

//Terminate without saving database to file
input.on('x', exit);

//****** Start TinyApp Server ******************************

//Get port from command line or fall back to constants.js
const args = require("./args");
const port = args.port > 0 ? args.port : constants.PORT;

const listen = () => {
  app.listen(port, () => {
    lg(`Listening on port ${port}`);
  });
};

//Determine whether to init db from file: cmdline arg trumps constants.js
let initFromFile = constants.PERSIST_TO_FILE;
if (args["init-from-file"]) {
  initFromFile = args["init-from-file"] === 'true' ? true : false;
}

if (initFromFile) {
  //Restore database from file and start listening
  //- In case the promise rejects, default data is used
  database.initFromFile().catch(() => {
    lg(`Database init from file failed; using default records`);
  }).finally(()=>{
    listen();
  });
} else {
  //Start without reading data from file (fall back to defaults)
  listen();
}
