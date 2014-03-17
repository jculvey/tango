
var model = null

module( "Text Inputs", {

  setup: function() {
    model = new Backbone.Model({
      firstName: "George",
      lastName: "Washington",
      age: 20,
      weight: 480,
      headcover: 'cap'
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

  ok( fname.valid );
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

  ok( fname.valid );
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

  ok( fname.valid );
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

  ok( fname.valid );
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

  ok( party.valid );
  ok( party.errors.length == 0 );
  ok( !party.el.prop('disabled') );
});

// Validators

//test( "required validator", function() {

  //var lastName = new Tango.TextInput('lastName', {
    //label: 'Last Name',
    //validate: {
      //required: true
    //}
  //}, model);

  //ok( lastName.value() == "Washington" );
  //ok( lastName.lastValue == "Washington" );
  //ok( lastName.modified() == false );

  //lastName.value("");
  //equal( lastName.valid, false );

  ////lastName.value("Foreman");
  ////equal( lastName.valid, true );

  ////lastName.el.val("");
  ////equal( lastName.valid, false );

  ////lastName.el.val("Costanza");
  ////equal( lastName.valid, true );
//});

// bad config








