Tango
=====

Still a work in progress.


## Overview

Tango is a javascript widget library that provides automatic two way binding
and easy input validation.

It can easily integrate with off the shelf CSS packages like Bootstrap 
and Foundation.

## Models 

Tango uses Backbone models to bind data to wigets.


```js
var model = new Backbone.Model({
  firstName: 'George',
  lastName: 'Washington',
  dob: '2/22/1732'
});

model.set('firstName', 'John');
model.set('lastName', 'Adams');

model.changed; // => { firstName: 'John', lastName: 'Adams' }
model.changedAttributes(); // => { firstName: 'John', lastName: 'Adams' }

// Do all the things you normally do with Backbone models.
model.toJSON();
model.save();

```

## Text Input

Tango.TextInput

### Usage Example

```js
var model = new Backbone.Model({
  firstName: "George",
  lastName: "Washington"
});

Tango.TextInput('firstName', {
  label: 'First Name',
  validate: {
    required: true,
    maxLength: 10
  }
}, model);

Tango.TextInput('lastName', {
  label: 'Last Name',
  validate: {
    required: true
  }
}, model);

```

## Text Area

### Usage Example

```js

var model = new Backbone.Model({
  description: "Something really awesome..."
});

Tango.TextArea('description', {
  label: "Description",
  rows: 20,
  cols: 15,
  validates: {
    required: true,
    maxLength: 10
  }
}, model);

```

## Checkbox

### Usage Example
```js

var model = new Backbone.Model({
  enableCheats: true
});

Tango.Checkbox('enableCheats', {
  label: "Are you cheating?",
}, model);

```

## Radio Buttons

Tango.RadioGroup

### Usage Example
```js

var model = new Backbone.Model({
  favoriteColor: "blue",
  labelLocation: "left",      // where the label appears, defaults to 'right'.
  colorOptions: [
      ['red', 'Red'],         // 'red' is button value, 'Red' is label text.
      ['blue', 'Blue'],
      ['orange', 'Orange']
  ]
});

var favColor = Tango.RadioGroup('favoriteColor', {
  label: "Choose your favorite",
  options: "colorOptions"
}, model);

favColor.value(); // => blue

favColor.button('red').value(); // false
favColor.button('blue').value(); // true

favColor.value('red');
favColor.button(0).checked(); // true. note the access by index.


```

## Select 

### Usage Example
```js
var model = new Backbone.Model({
  fruits: "banana"
});

var fruit = Tango.Select('fruits', {
  options: [
    ['apple', 'Apple'],
    ['banana', 'Banana'],
    ['orange', 'Orange']
  ]
}, model);

fruit.setOptions('bc', [
      ['bc', 'Black Currant'],
      ['bf', 'Bread Fruit'],
      ['wm', 'Watermelon']
  ]
);
```

## Autocomplete

### Usage Example

```js

var model = new Backbone.Model({
  state: "Alabama",
  stateOptions: [
      ['al', 'Alabama'],
      ['ny', 'New York'],
      ['wa', 'Washington']
  ]
});

var state = Tango.Autocomplete('state', {
  label: "State of Residence",
  options: "stateOptions"
}, model);

state.value(); // => al

state.setOptions('ky', [
      ['ky', 'Kentucky'],
      ['nv', 'Nevada'],
      ['ws', 'Wisconsin']
  ]
);

```

## Date Picker

Tango.DatePicker

Integrates with moment.js

### Usage Example

```html
<input type="text" data-bind="depart_date">

<input type="text" data-bind="depart_date" data-role="month">
<input type="text" data-bind="depart_date" data-role="day">>
<input type="text" data-bind="depart_date" data-role="year">>
```

```js

var model = new Backbone.Model({
  departure_date: '01/01/2015'
});

Tango.DatePicker('departure_date', {
  label: 'Date of Departure:',
  format: 'MM-DD-YYYY',
  validate: {
    after: '12-21-1984',
    before: '12-21-2040',
  }
}, model);

```

## Button

Tango.Button()

### Usage Example

```js

var button = Tango.Button({
  text: "Click me"
})

button.on('click', function(){
  alert("Button was clicked!");
});

```

## Custom Styling

You can easily over-ride the classes applied to the widget source element with
the config property `config.cssClass`. You can also override the classes applied 
to the container element and label element with `config.containerClass` and 
`config.labelClass`, respectively.

```js

var age = new Tango.TextInput('age', {
  label: 'Age:',
  cssClass: 'form-control input-sm'
}, model);

var weight = new Tango.TextInput('weight', {
  label: 'Weight:',
  labelClass: 'sr-only',
  containerClass: 'col-xs-2'
}, model);

```

## Custom Validators

Tango widgets have an extensible validator system. To add a custom
validator to your widget, simply call `widget.addValidator(callback)`,
where callback receives a copy of the `config.validate` object and returns
an array of error messages. It receives a context of the widget instance
that can be accessed with `this`.

### Usage Example

```js
var commentBox = Tango.TextInput('comment', {
  validate: {
    awesome: true
  }
}, model);


commentBox.addValidator( function(conf) {
  var val = this.el.val();
  var errors = [];

  if (conf.awesome) {
    if (!val.search('awesome')) {
      errors.push("That isn't awesome.");
    }
  }

  return errors;
});

```

## Forms

### Usage Example

```html
<form action="/action/foo" data-role="form">
  <input type="text" data-bind="firstName" />
  <input type="text" data-bind="lastName" />
  <button data-role="form_submit"/>
</form>
```

Works with manual or automatic widgets.

```js

var form = Tango.Form({
  inline: true
}, model);

form.valid;  // => true
form.errors; // => []

form.submit({
  action: "/path/to/foo",
  method: "PUT",
  success: function(response) {
    alert('success');
    console.log(response);
  },
  error: function(error) {
    alert('error');
  }
})

form.toJson() // => { firstName: 'George', lastName: 'Washington' }

```

## Tables

Under development...

## Lists

Under development...

## Example Code

```js

var model = new Backbone.Model({
  fruits: "apple",
  firstName: "George",
  lastName: "Washington"
});

// Widgets
var widgets = Tango.makeWidgets(config, model);
var fruitSelector = widget.get('fruits');

// Universal attributes
fruitSelector.valid // => true
fruitSelector.errors // => ['Must be a number']
fruitSelector.value() // => banana

fruitSelector.show()
fruitSelector.hide()

fruitSelector.enable()
fruitSelector.disable()


// Widget config items
var config = {
  parent:  '#content'   // The selector of the widget's ancestor. Defaults to 'body'.
  label: 'Foo',         // Desired label text.

  validate: {           // Validator configuration.
    required: true

    number: {
      minValue: 10,
      maxValue: 20
    }, 

    minLength: 10,
    maxLength: 20,

    format: {
      regex: "^[hc]at$",
      errorMessage: "Must be a cat or a hat."
    },

    matches: {              // Useful for passwords and email confirmation.
      target: 'password',
      errorMessage: "Confirmation must match password."
    },

    awesome: true
  },

  // Only enable the widget if the callback returns true
  enabledFn: function(model) {        
      return !!model.title
  },

  // The widget will be visible only if the callback returns true.
  visibleFn: function(model) {
      return model.showDescription
  },

  // The widget will be read-only if the callback returns true.
  readOnlyFn: function(model) {
      return model.allowEdit
  },

}
```

## FAQ

_Why Backbone?_

It's well designed and has a clean api. There's no need to re-invent
the wheel.

  _Why not just use Backbone Views?_

Templating is a useful waty to bind data to the DOM in some use cases. However,
in other apps that have a heavy use of forms or involve lots of interactivity,
maintaining input states and re-rendering templates can be difficult to manage. 

As a result, we sometimes we put logic in templates that seems like it's 
begging to live in javascript. This library aims to solve this problem.

Also, maintaining a consistent look and feel can become a burden. Tango helps by
automating the creation of elements in a consistent manner and letting 
you configure styles in a single place.


_Why not just use Knockout?_

Knockout is a wonderful project and definately provided some of the inspiration.

However, much like with templating a lot of logic can end up in the template, when
it would be easier to work with in javascript. 

_Why another thing?_

I'm as sick of the framework overload as anyone else. I couldn't find too many 
solutions for two way binding and form widgets that didn't involve adopting a much
larger framework along with it (I'm looking at you Angular, React, ExtJS, Kendo).

While there have been many great attempts at client side MVC frameworks, you don't
find many of the conveniences that you can in server side MVC frameworks that solve
froms, such as the form helper of rails, or the helper functions in django.forms.

The aim of tango is to provide a lightweight library for easy data binding and 
high quality widgets that is easy to integrate into your app.







