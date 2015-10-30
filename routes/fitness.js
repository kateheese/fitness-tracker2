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
});

router.get('/:id/days/:dayId', function(req, res) {
  lookups.findUser(req.params.id).then(function(user) {
    var calories = lookups.calculateCalories(user.weight,user.feet,user.inches,user.age,user.sex,user.activity,user.goal);
    lookups.findDay(req.params.dayId).then(function(day) {
      lookups.findFood(day._id).then(function(food) {
        var foodTotal = 0;
        food.forEach(function(food) {
          foodTotal += Number(food.calories);
        })
        lookups.findExercise(day._id).then(function(exercise) {
          var exerciseTotal = 0;
          exercise.forEach(function(workout) {
            exerciseTotal += Number(workout.calories);
          })
          res.render('fitness/day', {title: day.date,
            oauthUser: req.user,
            user: user,
            day: day,
            food: food,
            exercise: exercise,
            foodTotal: foodTotal,
            exerciseTotal: exerciseTotal,
            calories: calories,
            total: (calories-foodTotal+exerciseTotal),
            max: (calories+exerciseTotal) });
        })
      })
    })
  })
});

router.post('/:id/days/:dayId/delete', function(req, res) {
  lookups.deleteDay(req.params.dayId).then(function() {
    res.redirect('/fitness/' + req.params.id);
  })
});

router.post('/:id/days/:dayId/add-food', function(req, res) {
  lookups.findDay(req.params.dayId).then(function(day) {
    lookups.addFood(day._id, req.body.food, req.body.calories).then(function() {
      res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
    })
  })
});

router.post('/:id/days/:dayId/food/:foodId/delete', function(req, res) {
  lookups.deleteFood(req.params.foodId).then(function() {
    res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
  })
});

router.post('/:id/days/:dayId/add-exercise', function(req, res) {
  lookups.findDay(req.params.dayId).then(function(day) {
    lookups.addExercise(day._id, req.body.exercise, req.body.calories).then(function() {
      res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
    })
  })
});

router.post('/:id/days/:dayId/exercise/:exerciseId/delete', function(req, res) {
  lookups.deleteExercise(req.params.exerciseId).then(function() {
    res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
  })
})

module.exports = router;