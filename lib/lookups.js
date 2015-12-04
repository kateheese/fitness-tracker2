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
  dateFixer: function(date) {
    var arr = date.split('-');
    var newArr = [];
    newArr.push(arr[1]);
    newArr.push(arr[2]);
    newArr.push(arr[0]);
    return newArr.join('.');
  },
  oneUser: function(id) {
    return Users.findOne({ userId: id });
  },
  findUser: function(id) {
    return Users.findById(id);
  },
  addUser: function(id, age, sex, feet, inches, weight, activity, goal) {
    return Users.insert({ userId: id,
      age: age,
      sex: sex,
      feet: feet,
      inches: inches,
      weight: weight,
      activity: activity,
      goal: goal
    });
  },
  editUser: function(id, age, sex, feet, inches, weight, activity, goal) {
    return Users.updateById(id, {$set: {age: age,
      sex: sex,
      feet: feet,
      inches: inches,
      weight: weight,
      activity: activity,
      goal: goal}});
  },
  addDay: function(id, date) {
    var newDate = this.dateFixer(date)
    return Users.findById(id).then(function(user) {
      Days.insert({ user: user._id, date: newDate });
    });
  },
  findDays: function(id) {
    return Days.find({ user: id}, {sort: {date: 1}});
  },
  findDay: function(id) {
    return Days.findById(id);
  },
  duplicateDay: function(date) {
    return Days.find({date: this.dateFixer(date)})
  },
  deleteDay: function(id) {
    return Days.remove({ _id: id });
  },
  addFood: function(id, name, brand, calories, fat) {
    return Food.insert({ day: id, name: name, brand: brand, calories: calories, fat: fat });
  },
  findFood: function(id) {
    return Food.find({ day: id });
  },
  deleteFood: function(id) {
    return Food.remove({ _id: id });
  },
  addExercise: function(id, exercise, calories) {
    return Exercise.insert({ day: id, exercise: exercise, calories: calories });
  },
  findExercise: function(id) {
    return Exercise.find({ day: id });
  },
    deleteExercise: function(id) {
    return Exercise.remove({ _id: id });
  },
  queryFixer: function(query) {
    return query.split(' ').join('%20');
  }
}

module.exports = lookups;