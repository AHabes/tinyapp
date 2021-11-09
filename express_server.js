const express = require('express');
const app = express();
const PORT = 8080;


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(8080, () => {
  console.log(`The server is up and listening on port ${PORT}`)
});

app.get('/', (req, res) => {
  res.send("Hello World!")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});