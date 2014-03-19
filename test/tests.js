
var model = null

module( "Text Inputs", {

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

// basic creation and usage.

test( "basic minimal input creation", function() {
  var fname = new Tango.TextInput('firstName', {
    label: 'First Name'
  }, model);

  ok( fname.value() == "George" );
  ok( fname.lastValue == "George" );
  ok( fname.modified() == false );

  ok( fname.containerEl[0].nodeName == 'DIV' );
  debugger;
  ok( fname.labelEl.text() === 'First Name' );

  ok( fname.isValid() );
  ok( fname.errors.length == 0 );
  ok( !fname.el.prop('disabled') );
});

test( "basic minimal input usage", function() {
  var fname = new Tango.TextInput('firstName', {
    label: 'First Name'
  }, model);

  fname.value("Bob");
  ok( fname.value() == "Bob" );
  ok( fname.lastValue == "George" );
  ok( fname.modified() == true );

  ok( fname.isValid() );
  ok( fname.errors.length == 0 );
});


test( "model change", function() {
  var fname = new Tango.TextInput('firstName', {
    label: 'First Name'
  }, model);

  model.set('firstName', 'Bob');
  ok( fname.value() == "Bob" );
  ok( fname.lastValue == "George" );
  ok( fname.modified() == true );

  ok( fname.isValid() );
  ok( fname.errors.length == 0 );
});

test( "input change programatically", function() {
  var fname = new Tango.TextInput('firstName', {
    label: 'First Name'
  }, model);

  fname.el.val('Bob').change();
  ok( fname.value() == "Bob" );
  ok( fname.lastValue == "George" );
  ok( fname.modified() == true );

  ok( fname.isValid() );
  ok( fname.errors.length == 0 );
});

// bad inputs.

test( "no element", function() {
  throws( function(){
    var fname = new Tango.TextInput('noName', {
      label: 'No Name'
    }, model);
  }, "Couldn't find an input with the data-bind: noName" );
});

test( "no config", function() {
  var noConfig = new Tango.TextInput('firstName', undefined, model);
  noConfig = new Tango.TextInput('firstName', {}, model);
  noConfig = new Tango.TextInput('firstName', null, model);
  noConfig = new Tango.TextInput('firstName', [], model);
  noConfig = new Tango.TextInput('firstName', "hallo", model);
  ok( true );
});

test( "no model", function() {
 var makeWidget = function(noModel){
    return function() {
      var fname = new Tango.TextInput('firstName', {
        label: 'No Name'
      }, noModel);
    }
  }
  throws( makeWidget(undefined), "Can't initialize widget from empty model." );
  throws( makeWidget(null), "Can't initialize widget from empty model." );
  throws( makeWidget([]), "Can't initialize widget from empty model." );
  throws( makeWidget("foo"), "Can't initialize widget from empty model." );
});


test( "Model without attribute", function() {
  var party = new Tango.TextInput('party', {
    label: 'Political Party'
  }, model);

  party.value("Libertarian");

  ok( party.value() == "Libertarian" );
  ok( party.lastValue == "" );
  ok( party.modified() == true );

  ok( party.containerEl[0].nodeName == 'DIV' );
  ok( party.labelEl.text() === 'Political Party' );

  ok( party.isValid() );
  ok( party.errors.length == 0 );
  ok( !party.el.prop('disabled') );
});

// Validators

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






