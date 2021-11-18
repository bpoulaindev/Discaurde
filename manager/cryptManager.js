const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = {
  encrypt: async function (passwordPlain) {
    return bcrypt.hash(passwordPlain, saltRounds);
  },
  // returns true or false
  compare: async function (passwordPlain, passwordCrypted) {
    return bcrypt.compare(passwordPlain, passwordCrypted)
  },
}