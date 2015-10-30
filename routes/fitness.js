var express = require('express');
var router = express.Router();
var lookups = require('../lib/lookups.js');

router.get('/:id', function(req, res) {
  lookups.findUser(req.params.id).then(function(user) {
    var calories = lookups.calculateCalories(user.weight,user.feet,user.inches,user.age,user.sex,user.activity,user.goal)
    lookups.findDays(user._id).then(function(days) {
      res.render('fitness/dashboard', { title: 'Dashboard', 
        user: user,
        oauthUser: req.user,
        days: days,
        calories: calories });
    })
  })
});

router.post('/:id/new-day', function(req, res) {
  lookups.addDay(req.params.id, req.body.date).then(function() {
    res.redirect('/fitness/' + req.params.id);
  })
})

module.exports = router;