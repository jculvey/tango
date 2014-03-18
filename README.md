tango
=====

## Overview

Tango is a javascript widget library that provides automatic two way binding
and easy input validation.

Tango provides widgets for:
  - Form Handling
  - Inputs
    - text fields
    - textareas
    - select lists
    - checkboxes
    - radio buttons
    - autocompletion
    - datepicker
  - Lists
  - Tables

It can easily integrate with off the shelf CSS packages like Bootstrap 
and Foundation.

## View Models 

Tango uses Backbone models to bind data to wigets.

```js
var viewModel = new Backbone.Model({
  firstName: 'George',
  lastName: 'Washington',
  dob: '2/22/1732'
});

viewModel.set('firstName', 'John');
viewModel.set('lastName', 'Adams');

viewModel.changed; // => { firstName: 'John', lastName: 'Adams' }
viewModel.changedAttributes(); // => { firstName: 'John', lastName: 'Adams' }

viewModel.sync();

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

### Demo

<div class="row">
  <div class="large-4 columns">
    <label>
      First Name
      <input type="text" data-bind="firstName" value="George" />
    </label>

    <label>
      Last Name
      <input type="text" data-bind="lastName" value="Washington" />
    </label>
  </div>
</div>

## Text Area
Tango.TextArea()

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

### Demo

<div class="row">
  <div class="large-6 columns">
    <label>
       Description
      <textarea rows="2" cols="5" data-bind="description">
Something really awesome...
      </textarea>
</label>

  </div>
</div>

## Checkbox

Tango.Checkbox

### Usage Example
```js

var model = new Backbone.Model({
  enableCheats: true
});

Tango.TextArea('enableCheats', {
  label: "Are you cheating?",
}, model);

```

### Demo

<label>
   Are you cheating?
  <input type="checkbox" data-bind="enableCheats"/>
</label>

## Radio Buttons

Tango.RadioButtons

### Usage Example
```js

var model = new Backbone.Model({
  favoriteColor: "blue",
  colorOptions: [
      ['red', 'Red'],
      ['blue', 'Blue'],
      ['orange', 'Orange']
  ]
});

var fav = Tango.RadioButtons('favoriteColor', {
  label: "Choose your favorite",
  options: "colorOptions"
}, model);

fav.value(); // => blue

```

### Demo

<label>Choose Your Favorite</label>

<label >
  <input type="radio" name="favoriteColor" value="Red" data-bind="favoriteColor">
  Red
</label>

<label >
  <input type="radio" name="favoriteColor" value="Blue" data-bind="favoriteColor">
  Blue
</label>

<label >
  <input type="radio" name="favoriteColor" value="Orange" data-bind="favoriteColor">
  Orange
</label>


## Select 

### Usage Example
```js
var model = new Backbone.Model({
  fruits: "banana"
});

var fruit = Tango.selectWidget('fruits', {
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

### Demo

<div class="row">
  <div class="large-4 columns">
    <select data-bind="fruits" required="true">
      <option value="apple">Apple</option> 
      <option value="banana" selected>Banana</option>
      <option value="orange">Orange</option>
    </select>
  </div>
</div>

## Autocomplete

Tango.Autocomplete

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

Tango.Table(config, model);

### Usage Example

```js

```

## Lists

Tango.List(config, model);

### Usage Example

```js

```

## Events

### Usage Example

```js
widget.on('change:value', function(e){
  alert('Value of ' + e.target.dataBind + 'changed');
});
```

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
{
  label: "Foo",

  validate: {
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

    matches: {
      target: 'password',
      errorMessage: "Confirmation must match password."
    },

    custom: ['ipv4addr']
  },

  enabledFn: function(model) {
      return !!model.title
  },

  visibleFn: function(model) {
      return model.showDescription
  },

  readOnlyFn: function(model) {
      return model.allowEdit
  },

}
```



