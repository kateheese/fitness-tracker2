var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var passport = require('passport');
require('dotenv').load();
var cookieSession = require('cookie-session');

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
      profile.identifier=profile.id;
      return done(null, profile);
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/facebook/callback",
    enableProof: false,
    profileFields: ['id', 'displayName', 'photos']
  },
  function(accessToken, refreshToken, profile, done) {
      profile.identifier=profile.id;
      return done(null, profile);
  }
));

passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      profile.identifier=profile.id;
      return done(null, profile);
  }
));

var routes = require('./routes/index');
var fitness = require('./routes/fitness');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.KEY_1, process.env.KEY_2]
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});

app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
});

app.use('/', routes);
app.use('/fitness', fitness);

app.get('/auth/google',
  passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.profile' }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  function(req, res) {
    res.redirect('/fitness');
});

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/signin' }),
  function(req, res) {
    res.redirect('/fitness');
});

app.get('/auth/instagram',
  passport.authenticate('instagram'));

app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/signin' }),
  function(req, res) {
    res.redirect('/fitness');
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = app;
