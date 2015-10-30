var db = require('monk')('localhost/fitness');
var Users = db.get('users');
var Days = db.get('days');
var Food = db.get('food');
var Exercise = db.get('exercise');

var lookups = {
  calculateCalories: function(weight,feet,inches,age,sex,activity,goal) {
    var BMR = 0;
    if(sex === 'male') {
      BMR += (66.47 + (13.75*(weight/2.2)) + (5.0*((feet*12+ parseInt(inches))*2.54)) - (6.75*age));
    }
    if(sex === 'female') {
      BMR += (665.09 + (9.56*(weight/2.2)) + (1.84*((feet*12+ parseInt(inches))*2.54)) - (4.67*age));
    }
    if(goal === 'maintain') {
      return Math.floor(BMR*activity);
    }
    if(goal === 'lose') {
      return Math.floor(BMR*activity) - 500;
    }
        if(goal === 'gain') {
      return Math.floor(BMR*activity) + 500;
    }
  },
  oneUser: function(id) {
    return Users.findOne({ userId: id });
  },
  findUser: function(id) {
    return Users.findById(id);
  },
  addUser: function() {
    return Users.insert({ userId: req.user.id,
      age: req.body.age,
      sex: req.body.sex,
      feet: req.body.feet,
      inches: req.body.inches,
      weight: req.body.weight,
      activity: req.body.activity,
      goal: req.body.goal
    }).then(function() {
      res.redirect('/dashboard');
    })
  },
  addDay: function(id, date) {
    return Users.findOne({ userId: id }).then(function(user) {
      Days.insert({ user: user._id, date: date, food: [], exercise: [] });
    });
  },
  findDays: function(id) {
    return Days.find({ user: id});
  }
}

module.exports = lookups;