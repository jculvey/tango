var model = null;

module( "Checkbox", {
  setup: function() {
    model = new Backbone.Model({
      cheats: true
    });
  },

  teardown: function() {
    model = null;
  }
});

test( "checkbox basic usage", function() {
  var cheats = new Tango.TextArea('cheats', {
    label: 'Enable cheats'
  }, model);

  ok( cheats.value() === true );
  ok( cheats.labelEl.text() === 'Enable cheats' );
});

test( "checkbox value", function() {
  var cheats = new Tango.Checkbox('cheats', {
    label: 'Enable cheats'
  }, model);

  ok( cheats.value() === true );
  cheats.value('');
  ok( cheats.value() === false );
});

test( "checkbox no model", function() {
  var human = new Tango.Checkbox('human', {
    label: 'Are you human?'
  }, model);

  ok( human.value() === false );
  human.value(true);
  ok( human.value() === true );
});




