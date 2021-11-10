const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
const PORT = 3000;

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

const generateRandomString = function() {
  let result = '';
  const length = 6;
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

app.listen(PORT, () => {
  console.log(`The server is up and listening on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  console.log('redirecting to ', longUrl);
  res.redirect(longUrl);
});

app.post('/urls', (req, res) => {
  const shorURL = generateRandomString();
  urlDatabase[shorURL] = req.body.longURL;
  res.redirect(`/urls/${shorURL}`);
//  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

console.log(generateRandomString());