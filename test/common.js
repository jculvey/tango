var model = null;

module( "Common", {
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

test( "cssClass attribute", function() {
  var age = new Tango.TextInput('age', {
    cssClass: 'form-control input-sm'
  }, model);

  ok( age.el.hasClass('input-sm') );
});

test( "containerClass attribute", function() {
  var age = new Tango.TextInput('age', {
    containerClass: 'col-xs-2'
  }, model);

  ok( age.containerEl.hasClass('col-xs-2') );
});

test( "labelClass attribute", function() {
  var age = new Tango.TextInput('age', {
    label: 'Age:',
    labelClass: 'sr-only'
  }, model);

  ok( age.labelEl.hasClass('sr-only') );
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

