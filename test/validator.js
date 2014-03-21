var model = null;

module( "Validator", {
  setup: function() {
    model = new Backbone.Model({
      firstName: "George",
      lastName: "Washington",
      age: 40,
      weight: 210,
      email: "gwash@america.gov",
      catOrHat: "cat"
    });
  },

  teardown: function() {
    model = null;
  }
});

test( "required validator", function() {

  var lastName = new Tango.TextInput('lastName', {
    label: 'Last Name',
    validate: {
      required: true
    }
  }, model);

  ok( lastName.value() == "Washington" );
  ok( lastName.lastValue == "Washington" );
  ok( lastName.modified() == false );
  ok( lastName.isValid() );

  lastName.value("");
  equal( lastName.isValid(), false );

  lastName.value("Foreman");
  equal( lastName.isValid(), true );

  lastName.el.val("").change();
  equal( lastName.isValid(), false );

  lastName.el.val("Costanza").change();
  equal( lastName.isValid(), true );
});

test( "max length validator", function() {

  var lastName = new Tango.TextInput('lastName', {
    label: 'Last Name',
    validate: {
      maxLength: 4
    }
  }, model);

  ok( lastName.value() == "Washington" );
  ok( lastName.lastValue == "Washington" );
  ok( lastName.modified() == false );
  ok( lastName.isValid() == false );

  lastName.value("Lee");
  ok( lastName.isValid() );

  lastName.value("Foreman");
  ok( lastName.isValid() == false );

  lastName.el.val("Liu").change();
  ok( lastName.isValid() );

  lastName.el.val("Costanza").change();
  ok( lastName.isValid() == false );
});

test( "min length validator", function() {

  var lastName = new Tango.TextInput('lastName', {
    label: 'Last Name',
    validate: {
      minLength: 4
    }
  }, model);

  ok( lastName.value() == "Washington" );
  ok( lastName.lastValue == "Washington" );
  ok( lastName.modified() == false );
  ok( lastName.isValid() == true );

  lastName.value("Lee");
  ok( lastName.isValid() == false );

  lastName.value("Foreman");
  ok( lastName.isValid() );

  lastName.el.val("Liu").change();
  ok( lastName.isValid() == false );

  lastName.el.val("Costanza").change();
  ok( lastName.isValid() );
});


test( "numericality validator", function() {

  var age = new Tango.TextInput('age', {
    label: 'Age',
    validate: {
      number: true
    }
  }, model);

  ok( age.value() == 40 );
  ok( age.lastValue == 40 );
  ok( age.modified() == false );
  ok( age.isValid() == true );

  age.value("40s");
  ok( age.isValid() == false );

  age.value("4!0");
  ok( age.isValid() == false );

  age.value("?40");
  ok( age.isValid() == false );

  age.value("20");
  ok( age.isValid() );

  age.el.val("fd230").change();
  ok( age.isValid() == false );

  age.el.val("30").change();
  ok( age.isValid() );
});


test( "number minValue validator", function() {

  var age = new Tango.TextInput('age', {
    label: 'Age',
    validate: {
      number: {
        minValue: 25
      }
    }
  }, model);

  ok( age.isValid() == true );

  // Still has to be numeric
  age.value("40s");
  ok( age.isValid() == false );

  age.value("20");
  ok( age.isValid() == false );

  age.value("30");
  ok( age.isValid() );

  age.el.val("21").change();
  ok( age.isValid() == false );

  age.el.val("50").change();
  ok( age.isValid() );
});


test( "number maxValue validator", function() {

  var age = new Tango.TextInput('age', {
    label: 'Age',
    validate: {
      number: {
        maxValue: 60
      }
    }
  }, model);

  ok( age.isValid() == true );

  // Still has to be numeric
  age.value("40s");
  ok( age.isValid() == false );

  age.value("70");
  ok( age.isValid() == false );

  age.value("30");
  ok( age.isValid() );

  age.el.val("90").change();
  ok( age.isValid() == false );

  age.el.val("50").change();
  ok( age.isValid() );
});

test( "matches validator", function() {

  var email = new Tango.TextInput('email', {
    label: 'Email Address',
    validate: {
      required: true
    }
  }, model);

  var confirm = new Tango.TextInput('confirm', {
    label: 'Confirm Email Address',
    validate: {
      required: true,
      matches: {
        target: 'email',
        errorMsg: 'Confirmation must match email.'
      }
    }
  }, model);

  ok( email.isValid() );
  ok( confirm.isValid() == false );

  confirm.el.val("gwash@america.gov").change();
  ok( confirm.isValid() );

  email.el.val("aburr@america.gov").change();
  ok( confirm.isValid() == false );

});

test( "format validator", function() {

  var catOrHat = new Tango.TextInput('catOrHat', {
    label: 'Enter "cat" or "hat"',
    validate: {
      format: {
        regex: /[hc]at/,
        errorMsg: "Must be a cat or a hat."
      }
    },
  }, model);

  ok( catOrHat.isValid() );

  catOrHat.value("bird-dog");
  ok( catOrHat.isValid() == false );

  catOrHat.el.val("cat").change();
  ok( catOrHat.isValid() );

});

test( "enableFn validator", function() {

  var email = new Tango.TextInput('catOrHat', {
    label: 'Enter "cat" or "hat"',
    enableFn: function(model) {
      return model.get("weight") > 215;
    }
  }, model);

  ok( email.el.prop("disabled") );

  model.set('weight', 120);
  ok( email.el.prop("disabled") );

  model.set('weight', 220);
  ok( email.el.prop("disabled") == false );

});
