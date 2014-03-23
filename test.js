
var model = new Backbone.Model({
  firstName: "George",
  lastName: "Washington",
  age: 20,
  weight: 480,
  headcover: 'cap',
  colors: 'red',
  fruits: 'apple'
});

model.on('change', function(model) {
  console.log('changed: ' + JSON.stringify(model.changed));
});

var fname = new Tango.TextInput('firstName', {
  label: 'First Name',
  validate: {
    required: true,
    maxLength: 10,
    minLength: 4
  }
}, model);

var age = new Tango.TextInput('age', {
  label: 'Age',
  validate: {
    required: true,
    number: true
  }
}, model);

var weight = new Tango.TextInput('weight', {
  label: 'Weight',
  validate: {
    number: {
      minValue: 100,
      maxValue: 300
    }
  }
}, model);

var weight2 = new Tango.TextInput('weight2', {
  label: 'Weight 2',
  cssClass: "form-control input-sm",
  validate: {
    required: true,
    matches: {
      target: 'weight',
      errorMsg: 'Both weights must match.'
    }
  },
  visibleFn: function(model) {
    return !!(model.get('weight'))
  }
}, model);

var headcover = new Tango.TextInput('headcover', {
  label: 'headcover',
  validate: {
    format: {
      regex: /[hc]at/,
      errorMsg: "Must be a cat or a hat"
    }
  },
  enableFn: function(model) {
    return model.get("weight") > 215;
  }
}, model);

var party = new Tango.TextInput('party', {
  label: "Political Party",
  placeholder: "Ex. Libertarian"
}, model);

var blurb = new Tango.TextArea('blurb', {
  label: "Blurb:",
  placeholder: "Enlightening Information"
}, model);

var enableCheats = new Tango.Checkbox('cheats', {
  label: "Enable Cheats"
}, model);

// Radio buttons

//var blue = new Tango.RadioButton('colors', {
  //label: "Blue",
  //parentSelector: '#colors',
  //radioValue: "blue"
//}, model);

//var red = new Tango.RadioButton('colors', {
  //label: "Red",
  //parentSelector: '#colors',
  //radioValue: "red"
//}, model);

//var apple = new Tango.RadioButton('fruits', {
  //label: "Apple",
  //parentSelector: '#colors',
  //radioValue: "apple"
//}, model);

//var banana = new Tango.RadioButton('fruits', {
  //label: "Banana",
  //parentSelector: '#colors',
  //radioValue: "banana"
//}, model);


// <input type="radio" data-bind="fruits" value="apple"/>
var fruits = new Tango.RadioGroup('fruits', {
  label: "Choose your favorite",
  options: [
    ['apple', 'Apple'],
    ['banana', 'Banana']
  ]
}, model);

// <div id="colors">
var colors = new Tango.RadioGroup('colors', {
  label: "Choose your favorite",
  options: [
    ['red', 'Red'],
    ['blue', 'Blue'],
  ]
}, model);


$('.select').chosen();



