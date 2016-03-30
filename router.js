const passport = require('passport');

const AuthenticationCtrl = require('./controllers/authentication');

// Setup passport strategies
require('./services/passport');

// Middleware
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

const router = (app) => {
  // dummy router, to be deleted
  app.get('/', requireAuth, (req, res) => {
    res.send({ secret: 'Foobar!' });
  });

  // signin middleware transforms email+password into user
  // user gets passed to signin controller
  // and returns token
  app.post('/signin', requireSignin, AuthenticationCtrl.signin);
  // signup passes email+password to controller
  // and returns token
  app.post('/signup', AuthenticationCtrl.signup);
}

module.exports = router;
