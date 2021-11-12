const getUserByEmail = function(email, users) {
  return Object.keys(users).filter(id => users[id].email === email);
};

module.exports = {getUserByEmail};