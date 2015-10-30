var express = require('express');
var router = express.Router();
var lookups = require('../lib/lookups.js');

router.get('/', function(req, res) {
  res.render('index', { title: 'Title' });
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'About', oauthUser: req.user });
});

router.get('/signin', function(req, res) {
  res.render('signin', { title: 'Sign In'});
});

router.get('/fitness', function(req, res) {
  lookups.oneUser(req.user.id).then(function(user) {
    if(user) {
      res.redirect('/fitness/' + user._id);
    } else {
      res.redirect('/new');
    }
  })
});

router.get('/new', function(req, res) {
  res.render('new', { title: 'New User', oauthUser: req.user });
});

router.post('/new', function(req, res) {
  lookups.addUser().then(function(user) {
    res.redirect('/fitness/' + user._id);
  })
});

router.get('/signout', function(req, res) {
  req.session = null;
  res.redirect('/signin');
});

module.exports = router;
