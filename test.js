
var model = new Backbone.Model({
  firstName: "George",
  lastName: "Washington",
  age: 20,
  weight: 480,
  headcover: 'cap'
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

// More complicated view models
var ViewModel = Backbone.Model.extend({
  fullName: function() {
      return this.get('firstName') + ' ' + this.get('lastName');
  }
});

var viewModel = new ViewModel({
  firstName: 'George',
  lastName: 'Washington',
  dob: '2/22/1732'
});


