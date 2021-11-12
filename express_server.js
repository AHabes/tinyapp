const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const keygrip = require('keygrip');

const app = express();
app.set("view engine", "ejs");

const keyList = ['SEKRIT3', 'SEKRIT2', 'SEKRIT1'];
const keys = keygrip(keyList);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: keys,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const PORT = 8080;

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {};

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

const urlsForUser = function(id) {
  return Object.keys(urlDatabase).filter(shortURL => urlDatabase[shortURL].userID === id);
};

app.listen(PORT, () => {
  console.log(`The server is up and listening on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send("<html><body><b>Welcome to the Tinyapp, to start, please register</b></body></html>\n");
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

app.get('/urls', (req, res) => {
  const sessionUserId = req.session.user_id;
  const user = users[sessionUserId];
  if (user) {
    const userUrls = Object.fromEntries(
      Object.entries(urlDatabase).filter(([_, value]) => value.userID === user.id));
    const templateVars = {urls: userUrls, user: users[sessionUserId]};
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/new", (req, res) => {
  const sessionUserId = req.session.user_id;
  const user = users[sessionUserId];
  const templateVars = {user};
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const sessionUserId = req.session.user_id;
  const user = users[sessionUserId];
  if (user) {
    if (urlsForUser(user.id).includes(req.params.shortURL)) {
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user
      };
      res.render('urls_show', templateVars);
    } else {
      res.send("<html><body><h3 style='color:red'>Ooops that is an invalid tiny url!</h3></body></html>");
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const sessionUserId = req.session.user_id;
  const user = users[sessionUserId];
  if (user) {
    const longUrl = urlDatabase[req.params.shortURL];
    res.redirect(longUrl);
  } else {
    res.redirect('/login');
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.statusCode = 400;
    res.send("<html><body><h3>email and password fields can't be empty</h3></body></html>");
  } else if (getUserId(email).length) {
    res.statusCode = 400;
    res.send(`The email ${email} already exists`);
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id,
      email,
      password: hashedPassword
    };
    console.log('req.session ', req.session);
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.post('/urls', (req, res) => {
  const sessionUserId = req.session.user_id;
  const user = users[sessionUserId];
  let longURL = req.body.longURL;
  if (user) {
    const shorURL = generateRandomString();
    urlDatabase[shorURL] = {};
    if (!longURL.includes('http')) {
      longURL = 'https://' + longURL;
    }
    urlDatabase[shorURL].longURL = longURL;
    urlDatabase[shorURL].userID = user.id;
    res.redirect(`/urls/${shorURL}`);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const sessionUserId = req.session.user_id;
  const user = users[sessionUserId];
  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = getUserId(email);
  if (email === "" || password === "") {
    res.send("<html><body><h3>Username and password can't be empty</h3></body></html>");
  } else if (userId.length === 0) {
    res.statusCode = 403;
    res.send(`The user with email address ${email} is not found, please make sure to register first!`);
  } else {
    if (bcrypt.compareSync(password, users[userId].password)) {
      req.session.user_id = userId;
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send("<html><body><h3>Either username or password is incorrect</h3></body></html>");
    }
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});
