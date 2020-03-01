const LoacalStrategy = require("passport-local").Strategy;
// const passport = require('passport')
const User = require("../src/models/user");
const bcrypt = require("bcryptjs");

module.exports = function(passport) {
  passport.use(
    new LoacalStrategy(async (username, password, done) => {
      let user;
      try {
        user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { errors:{
            text: 'not found'
          }});
        }
      } catch (e) {
        return done(e);
      }

      let match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Not a matching password" });
      }

      return done(null, user);
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
