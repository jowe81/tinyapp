const constants = require("./constants");

const { lg } = require("@jowe81/lg");

const express = require("express");
const app = express();


app.get('/', (req,res) => {
  res.send("Hello!");
});

app.listen(constants.PORT, () => {
  lg(`Example app listening on port ${constants.PORT}`, "App");
});

