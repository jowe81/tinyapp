const constants = require("./constants");

const express = require("express");
const app = express();


app.get('/', (req,res) => {
  res.send("Hello!");
});

app.listen(constants.PORT, () => {
  console.log(`Example app listening on port ${constants.PORT}`);
});

