var express = require('express');
var router = express.Router();
var unirest = require('unirest');
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

router.get('/:id/edit', function(req, res) {
  lookups.findUser(req.params.id).then(function(user) {
    res.render('fitness/edit', { title: 'Edit', user: user, oauthUser: req.user, id: req.params.id });
  })
});

router.post('/:id/update', function(req, res) {
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
    lookups.findUser(req.params.id).then(function(user) {
      res.render('fitness/edit', { title: 'Edit User',
        oauthUser: req.user,
        errors: errors,
        age: req.body.age,
        sex: req.body.sex,
        feet: req.body.feet,
        inches: req.body.inches,
        weight: req.body.weight,
        activity: req.body.activity,
        goal: req.body.goal,
        id: req.params.id });
    });
  } else {
    lookups.editUser(req.params.id, req.body.age, req.body.sex, req.body.feet, req.body.inches, req.body.weight, req.body.activity, req.body.goal).then(function() {
      res.redirect('/fitness/' + req.params.id);
    })
  }
});

router.post('/:id/new-day', function(req, res) {
  lookups.duplicateDay(req.body.date).then(function(resultsDate) {
    var errors = [];
    if(!req.body.date.trim()) {
      errors.push("Please select a date");
    }
    if(resultsDate.length > 0) {
      errors.push("Date already exists");
    }
    if(errors.length) {
      lookups.findUser(req.params.id).then(function(user) {
        var calories = lookups.calculateCalories(user.weight,user.feet,user.inches,user.age,user.sex,user.activity,user.goal)
        lookups.findDays(user._id).then(function(days) {
          res.render('fitness/dashboard', { title: 'Dashboard', 
            user: user,
            oauthUser: req.user,
            days: days,
            calories: calories,
            errors: errors });
        })
      })
    } else {
      lookups.addDay(req.params.id, req.body.date).then(function() {
        res.redirect('/fitness/' + req.params.id);
      })
    }
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

router.post('/:id/days/:dayId', function(req, res) {
  var errors = [];
  if(!req.body.query.trim()) {
    errors.push("Oops. Your search was empty.")
  }
  if(errors.length) {
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
              max: (calories+exerciseTotal),
              errors: errors });
          })
        })
      })
    })
  } else {
    res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId + '/search/' + req.body.query);
  }
})

router.get('/:id/days/:dayId/search/:query', function(req, res) {
  lookups.findUser(req.params.id).then(function(user) {
    unirest.get('https://api.nutritionix.com/v1_1/search/' + lookups.queryFixer(req.params.query) + '?fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=' + process.env.NUTRITIONIX_ID + '&appKey=' + process.env.NUTRITIONIX_KEY)
      .end(function (response) {
        var results = response.body.hits
          res.render('fitness/food', { title: 'Add Food', user: user, oauthUser: req.user, results: results, dayId: req.params.dayId });
      });
  });
})

router.post('/:id/days/:dayId/add-food', function(req, res) {
  var errors = [];
  if(!req.body.name.trim()) {
    errors.push("Food name can't be blank");
  }
  if(!req.body.calories.trim()) {
    errors.push("Calories can't be blank");
  }
  if(req.body.calories.trim() && !/^\d+$/.test(req.body.calories)) {
    errors.push("Calories must be a number");
  }
  if(errors.length) {
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
              max: (calories+exerciseTotal),
              errors: errors });
          })
        })
      })
    })
  } else {
    lookups.findDay(req.params.dayId).then(function(day) {
      lookups.addFood(day._id, req.body.name, req.body.brand, req.body.calories, req.body.fat).then(function() {
        res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
      })
    })
  }
});

router.post('/:id/days/:dayId/food/:foodId/delete', function(req, res) {
  lookups.deleteFood(req.params.foodId).then(function() {
    res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
  })
});

router.post('/:id/days/:dayId/add-exercise', function(req, res) {
  var errors = [];
  if(!req.body.exercise.trim()) {
    errors.push("Food name can't be blank");
  }
  if(!req.body.calories.trim()) {
    errors.push("Calories can't be blank");
  }
  if(req.body.calories.trim() && !/^\d+$/.test(req.body.calories)) {
    errors.push("Calories must be a number");
  }
  if(errors.length) {
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
              max: (calories+exerciseTotal),
              errors: errors });
          })
        })
      })
    })
  } else {
    lookups.findDay(req.params.dayId).then(function(day) {
      lookups.addExercise(day._id, req.body.exercise, req.body.calories).then(function() {
        res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
      })
    })
  }
});

router.post('/:id/days/:dayId/exercise/:exerciseId/delete', function(req, res) {
  lookups.deleteExercise(req.params.exerciseId).then(function() {
    res.redirect('/fitness/' + req.params.id + '/days/' + req.params.dayId);
  })
})

module.exports = router;