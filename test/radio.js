var model = null;

module( "RadioGroup", {
  setup: function() {
    model = new Backbone.Model({
      colors: "blue",
      fruits: "apple",
      smell: "good"
    });
  },

  teardown: function() {
    model = null;
  }
});


test( "radio group basic usage", function() {
  var fruits = new Tango.RadioGroup('fruits', {
    label: 'Favorite Fruit',
    parentSelector: '#qunit-fixture',
    options: [
      ['apple', 'Apple'],
      ['banana', 'Banana']
    ]
  }, model);

  ok( fruits.value() === 'apple' );
  ok( fruits.labelEl.text() === 'Favorite Fruit' );

  fruits.value('banana') 
  ok( fruits.model.get('fruits') === 'banana' );

  var apple = fruits.button('apple');

});

test( "radio group no source node", function() {
  var colors = new Tango.RadioGroup('colors', {
    label: 'Favorite Color',
    parentSelector: '#qunit-fixture',
    options: [
      ['red', 'Red'],
      ['blue', 'Blue']
    ]
  }, model);

  ok( colors.value() === 'blue' );
  ok( colors.labelEl.text() === 'Favorite Color' );

  colors.value('red') 
  ok( colors.model.get('colors') === 'red' );

});

test( "radio group div source", function() {
  var smells = new Tango.RadioGroup('smell', {
    label: 'How does it smell?',
    parentSelector: '#qunit-fixture',
    options: [
      ['good', 'Good'],
      ['bad', 'Bad']
    ]
  }, model);

  ok( smells.value() === 'good' );

  smells.value('bad') 
  ok( smells.model.get('smell') === 'bad' );
});



