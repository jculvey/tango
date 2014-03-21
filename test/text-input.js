var model = null;

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

// Attributes
test( "label attribute", function() {
  var party = new Tango.TextInput('party', {
    label: "Political Party"
  }, model);

  ok( party.labelEl.text() == "Political Party" );
});

test( "placeholder attribute", function() {
  var party = new Tango.TextInput('party', {
    label: "Political Party",
    placeholder: "Ex. Libertarian"
  }, model);

  ok( party.el.prop('placeholder') == 'Ex. Libertarian' );
});

