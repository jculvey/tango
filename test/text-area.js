var model = null;

module( "TextArea", {

  setup: function() {
    model = new Backbone.Model({
      firstName: "George",
      lastName: "Washington",
      blurb: "Hello world!"
    });
  },

  teardown: function() {
    model = null;
  }

});


// TextArea
test( "textarea basic usage", function() {
  var blurb = new Tango.TextArea('blurb', {
    label: 'Enter a blurb',
    placeholder: 'Lorem ipsum dolar',
  }, model);

  ok( blurb.value() === 'Hello world!' );
  ok( blurb.labelEl.text() === 'Enter a blurb' );

  ok( blurb.el.prop('placeholder') === 'Lorem ipsum dolar' );
});


test( "textarea no model", function() {
  var post = new Tango.TextArea('post', {
    label: 'Post',
  }, model);

  ok( post.value() === '' );
  ok( model.get('post') === '');

  post.value('foo bar');
  ok( post.value() === 'foo bar' );
  ok( model.get('post') === 'foo bar');
});

test( "textarea validator", function() {
  var post = new Tango.TextArea('post', {
    label: 'Post',
    validate: {
      required: true,
      maxLength: 10
    }
  }, model);

  ok( post.isValid() == false );

  post.value('foo bar');
  ok( post.isValid() );

  post.value('foo bar baz qux');
  ok( post.isValid() == false );
});


test( "textarea rows cols", function() {
  var post = new Tango.TextArea('post', {
    label: 'Post',
    rows: 10,
    cols: 10
  }, model);

  ok( post.el.prop('rows') == 10 );
  ok( post.el.prop('cols') == 10 );
});

