const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
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

const getUserId = function(email) {
  return Object.keys(users).filter(id => users[id].email === email);
};

app.listen(PORT, () => {
  console.log(`The server is up and listening on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.get('/register', (req, res) => {
  res.render('registration');

});

app.get('/login', (req, res) => {
  res.render('login');

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {user};
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  console.log('redirecting to ', longUrl);
  res.redirect(longUrl);
});

app.post('/register', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.statusCode = 400;
    res.send("email and password fields can't be empty");
  } else if (getUserId(email).length) {
    res.statusCode = 400;
    res.send(`The email ${email} already exists`);
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      password
    };
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.post('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    const shorURL = generateRandomString();
    urlDatabase[shorURL] = req.body.longURL;
    res.redirect(`/urls/${shorURL}`);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = getUserId(email);
  if (userId.length === 0) {
    res.statusCode = 403;
    res.send(`The user with email address ${email} is not found`);
  } else {
    if (password !== users[userId].password) {
      res.statusCode = 403;
      res.send(`Either username or password is incorrect`);
    } else {
      res.cookie('user_id', userId);
      res.redirect('/urls');
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

