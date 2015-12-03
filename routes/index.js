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
  var errors = [];
  if(!req.body.age.trim()) {
    errors.push("Age can't be blank");
  }
  if(req.body.age.trim() && !/^\d+$/.test(req.body.age)) {
    errors.push("Age must be a number");
  }
  if(req.body.sex == undefined) {
    errors.push("Please select a sex");
  }
  if(!req.body.feet.trim()) {
    errors.push("Feet can't be blank");
  }
  if(req.body.feet.trim() && !/^\d+$/.test(req.body.feet)) {
    errors.push("Feet must be a number");
  }
  if(!req.body.inches.trim()) {
    errors.push("Inches can't be blank");
  }
  if(req.body.inches.trim() && !/^\d+$/.test(req.body.inches)) {
    errors.push("Inches must be a number");
  }
  if(!req.body.weight.trim()) {
    errors.push("Weight can't be blank");
  }
  if(req.body.weight.trim() && !/^\d+$/.test(req.body.weight)) {
    errors.push("Weight must be a number");
  }
  if(req.body.activity == undefined) {
    errors.push("Please select a level of activity");
  }
  if(req.body.goal == undefined) {
    errors.push("Please select weight goal");
  }
  if(errors.length) {
    res.render('new', { title: 'New User',
      oauthUser: req.user,
      errors: errors,
      age: req.body.age,
      sex: req.body.sex,
      feet: req.body.feet,
      inches: req.body.inches,
      weight: req.body.weight,
      activity: req.body.activity,
      goal: req.body.goal });
  } else {
    lookups.addUser(req.user.id, req.body.age, req.body.sex, req.body.feet, req.body.inches, req.body.weight, req.body.activity, req.body.goal).then(function(user) {
      res.redirect('/fitness/' + user._id);
    })
  }
});

router.get('/signout', function(req, res) {
  req.session = null;
  res.redirect('/signin');
});

module.exports = router;
