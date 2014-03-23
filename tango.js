(function(root) {

  var Tango = {};
  Tango.version = '0.1.0';
  Tango.hello = function(){ alert('hello!') };
  var debug = true;
  var log = noop = function() {};

  if (debug) {
    log = function(msg) {
      console.log(msg);
    }
  }

  Tango.styleConfig = Tango._defaultStyleConfig = {
    containerClass: "form-group",
    labelClass: "control-label",

    textInputClass: "form-control",
    textAreaClass: "form-control",

    checkboxContainerClass: "checkbox",
    checkboxClass: "",

    radioOptionContainerClass: "radio",
    radioOptionClass: "",

    radioGroupClass: "tango-radio-group",

    // Status classes
    warningClass: "has-warning",
    errorClass: "has-error",

    // Error messages
    requiredErr: "Field is required.",
    maxLenErr: "Field exceeds maximum length: <%= maxLength %>",
    minLenErr: "Field is less than minimum length: <%= maxLength %>",

    numberErr: "Must enter a numerical value.",
    minValErr: "Value must be greater than: <%= minValue %>.",
    maxValErr: "Value must be less than: <%= maxValue %>.",

    formatErr: "Invalid format.",
    matchErr: "Confirmation must match."
  };

  // Helper Functions
  function toggleErrorClass(el, containerEl, errors){
    var valid = errors.length === 0;
    var errorClass = Tango.styleConfig.errorClass;
    if(valid) {
      containerEl.removeClass(errorClass);
    }
    else {
      containerEl.addClass(errorClass);
    }
  }

  var WidgetBase = {
    errors: [],

    initialize: function(dataBind, config, model) {
      this._dataBind = dataBind;
      this._config = (config || {});
      // TODO: handle null model
      this.model = model;

      var parent = $(config.parentSelector);
      if (parent.length !== 0) {
        this._parent = parent;
      }
      else {
        this._parent = $('body');
      }

      // Create the element
      this._createElement();

      this._setInitialValue();

      // Set the identifier for later use
      this.el.attr('id') || this.el.attr('id', _.uniqueId('tango-'));

      // Create container
      this._createContainer();

      // Create a label if needed
      this._createLabel();

      // Add Styling
      this._applyStyling();

      // validate initial state.
      this._validate();

      /// Data binding
      // Wire model to widget 
      // Handle model changes to just this attribute
      var event = 'change:' + this._dataBind;
      model.on(event, function() {
        this._modelChangeHandler();
      }, this);

      // Wire widget to model 
      var self = this;
      this.el.on('change', function(e){
        self._elementChangeHandler(this, self);
      });

      // Handle visible and enabled for initial state
      toggleIf.call(this, this._config.enableFn, this.enable, this.disable);
      toggleIf.call(this, this._config.visibleFn, this.show, this.hide);

      // Handle global model change
      model.on("change", function() {
        toggleIf.call(this, config.enableFn, this.enable, this.disable);
        toggleIf.call(this, config.visibleFn, this.show, this.hide);
      }, this);

    },

    addValidator: function(fn) {
      _validateFunctions.push(fn);
    },

    _applyStyling: function() {
      var cssClass = this._config.cssClass || this._defaultCssClass;
      this.el.addClass(cssClass);
    },

    _createElement: function() {
      var el = $('[data-bind=' + this._dataBind + ']');
      if (el.length == 0) {
        var msg = "Couldn't find an input with the data-bind: " + this._dataBind;
        throw new Error(msg);
      }
      else {
        this.el = el;
      }
    },

    _createLabel: function() {
      if (this._config.label) {
        var cssClass = this._config.labelClass ||
                       Tango.styleConfig.labelClass;
        var forId = this.el.attr('id');
        var label = '<label for="' + forId + '" class="' + cssClass + '">'
                    + this._config.label + '</label>';
        this.labelEl = $(label).insertBefore(this.el);
      }
    },

    _createContainer: function() {
      var cssClass = this._config.containerClass || Tango.styleConfig.containerClass;
      var id = _.uniqueId('tango-');
      var container = '<div class="' + cssClass + '" id="' + id + '">';
      var containerEl = $(container).insertBefore(this.el);
      containerEl.append(this.el);
      this.containerEl =  containerEl;
    },

    _elementChangeHandler: function(selector, widget) {
      var val = $(selector).val();
      this.value(val);
    },

    _modelChangeHandler: function(e) {
      this.el.val(this.model.get(this._dataBind));
      this._validate();
    },

    _setInitialValue: function() {
      var initialValue = this.el.val();
      if(this.model.has(this._dataBind)){
        initialValue = this.model.get(this._dataBind);
        this.el.val(initialValue);
      }
      else {
        this.model.set(this._dataBind, initialValue);
      }
      this.lastValue = initialValue;
    },

    // To be overridden by subclass if they have any validators
    _validateFunctions: [],

    _validate: function(){
      if (!this._config.validate) {
        return;
      }

      var errors = [];
      _.each(this._validateFunctions, function(fn) {
        // sort of wasteful, but meh.
        errors = errors.concat(fn.call(this, this._config.validate));
      }, this);

      toggleErrorClass(this.el, this.containerEl, errors);
      this.errors = errors;
    },

    show: function(){
      this.containerEl.show();
    },

    hide: function(){
      this.containerEl.hide();
    },

    enable: function(){
      this.el.prop('disabled', false);
    },

    disable: function(){
      this.el.prop('disabled', true);
    },

    reset: function(){
      // Don't use this.value so that the lastValue is reset as well.
      this.model.set(this.dataBind, this.lastValue);
    },

    modified: function() {
      return this.value() !== this.lastValue;
    },

    isValid: function(){
      return this.errors.length == 0;
    },

    value: function(newValue){
      if ( newValue !== undefined ) {
        this.lastValue = this.model.get(this._dataBind) || "";
        this.model.set(this._dataBind, newValue);
      }
      else {
        return this.model.get(this._dataBind);
      }
    }

  };

  function toggleIf(fn, trueCb, falseCb) {
    if (fn) {
      var cond = fn(this.model);
      if (cond) {
        trueCb.call(this);
      }
      else {
        falseCb.call(this);
      }
    }
  }

  function validateRequired(conf) {
    var val = this.el.val();
    var errors = [];

    if (conf.required) {
      if (!val) {
        var errMsg = Tango.styleConfig.requiredErr;
        errors.push(errMsg);
      }
    }

    return errors;
  }

  function validateMaxLength(conf) {
    var val = this.el.val();
    var errors = [];

    if (conf.maxLength) {
      if (val.length > conf.maxLength){
        var templateData = {maxLength: conf.maxLength}
        var errMsg = _.template(Tango.styleConfig.maxLenErr, templateData);
        errors.push(errMsg);
      }
    }

    return errors;
  }

  function validateMinLength(conf) {
    var val = this.el.val();
    var errors = [];

    if (conf.minLength) {
      if (val.length < conf.minLength){
        var templateData = {maxLength: conf.minLength}
        var errMsg = _.template(Tango.styleConfig.minLenErr, templateData);
        errors.push(errMsg);
      }
    }

    return errors;
  }

  function validateNumber(conf) {
    var val = this.el.val();
    var errors = [];

    var numberSpec = conf.number;
    if (numberSpec) {
      var isNumber = $.isNumeric(val);

      if (val && !isNumber){
        errors.push(Tango.styleConfig.numberErr);
      }

      // If a number validation spec was specified, check for min/max, etc.
      // number: { min: 20, max: 40 }
      if(val && _.isObject(numberSpec) && isNumber){
        var numberValue = parseFloat(val) || parseInt(val);

        if(numberSpec.minValue && numberValue < numberSpec.minValue) {
          var templateData = {minValue: numberSpec.minValue}
          var errMsg = _.template(Tango.styleConfig.minValErr, templateData);
          errors.push(errMsg);
        }

        if(numberSpec.maxValue && numberValue > numberSpec.maxValue) {
          var templateData = {maxValue: numberSpec.maxValue}
          var errMsg = _.template(Tango.styleConfig.maxValErr, templateData);
          errors.push(errMsg);
        }
      }
    }

    return errors;
  }

  function validateFormat(conf) {
    var val = this.el.val();
    var errors = [];

    if (conf.format) {
      var regex = conf.format.regex;

      if (val && regex && !regex.exec(val)){
        if (conf.format.errorMsg) {
          errors.push(conf.format.errorMsg);
        }
        else {
          errors.push(Tango.styleConfig.formatErr);
        }
      }
    }

    return errors;
  }

  function validateMatches(conf) {
    var val = this.el.val();
    var errors = [];

    if (conf.matches) {
      var matchingEl = $('[data-bind=' + conf.matches.target + ']');

      if (!!matchingEl.length) {
        if ( val && !(val === matchingEl.val()) ){
          if (conf.matches.errorMsg) {
            errors.push(conf.matches.errorMsg);
          }
          else {
            errors.push(Tango.styleConfig.matchErr);
          }
        }
      }
      else {
        log('Invalid target for match validator: ' + conf.matches.target);
      }
    }

    return errors;
  }

  var TextInput = Tango.TextInput = function(dataBind, config, model) {
    this.initialize.apply(this, arguments);
  };

  _.extend(TextInput.prototype, WidgetBase, {
    superclass: WidgetBase,

    initialize: function(dataBind, config, model) {
      this.superclass.initialize.apply(this, arguments);
      config = (config || {});

      // Add widget specific attributes
      if (config.placeholder) {
        this.el.prop('placeholder', config.placeholder);
      }

      var self = this;
      this.el.on('keyup', function(e){
        var val = $(this).val();
        self.value($(this).val());
      });

      // if a match validator exists, re-validate when the target changes.
      if ( config.validate && config.validate.matches ) {
        var matchingEl = $('[data-bind=' + config.validate.matches.target + ']');
        matchingEl.keyup( $.proxy(this._validate, this) );
        matchingEl.on('change', $.proxy(this._validate, this) );
      }

    },

    _defaultCssClass: Tango.styleConfig.textInputClass,

    _validateFunctions: [
      validateRequired,
      validateMinLength,
      validateMaxLength,
      validateNumber,
      validateFormat,
      validateMatches
    ],

  });

  var TextArea = Tango.TextArea = function(dataBind, config, model) {
    this.initialize.apply(this, arguments);
  };

  _.extend(TextArea.prototype, WidgetBase, {
    superclass: WidgetBase,

    initialize: function(dataBind, config, model) {
      this.superclass.initialize.apply(this, arguments);
      config = (config || {});

      // Add widget specific attributes
      if (config.placeholder) {
        this.el.prop('placeholder', config.placeholder);
      }

      if (config.rows) {
        this.el.prop('rows', config.rows);
      }
      if (config.cols) {
        this.el.prop('cols', config.cols);
      }

      var self = this;
      this.el.on('keyup', function(e){
        var val = $(this).val();
        self.value($(this).val());
      });

    },

    _defaultCssClass: Tango.styleConfig.textAreaClass,

    _validateFunctions: [
      validateRequired,
      validateMinLength,
      validateMaxLength
    ]

  });

  var Checkbox = Tango.Checkbox = function(dataBind, config, model) {
    this.initialize.apply(this, arguments);
  };

  _.extend(Checkbox.prototype, WidgetBase, {
    superclass: WidgetBase,

    initialize: function(dataBind, config, model) {
      config = (config || {});
      config.containerClass = config.containerClass ||
                              Tango.styleConfig.checkboxContainerClass;

      this.superclass.initialize.apply(this, arguments);

      // Set the initial value
      var initialValue = this.el.prop('checked');
      if(model.has(dataBind)){
        modelVal = model.get(dataBind);
        initialValue = (_.isBoolean(modelVal) && modelVal) || false;

        // If the val already in the model isn't a boolean, reinitialize as a bool.
        if ( !_.isBoolean(modelVal) ) {
          model.set(dataBind, !!initialValue);
        }

        this.el.val(initialValue);
      }
      else {
        model.set(dataBind, initialValue);
      }
      this.lastValue = initialValue;
    },

    _defaultCssClass: Tango.styleConfig.checkboxClass,

    _elementChangeHandler: function(selector, widget) {
      var val = $(selector).prop('checked');
      this.value(val);
    },

    _modelChangeHandler: function(e) {
      this.el.prop('checked', this.model.get(this._dataBind));
    },

    value: function(newValue){
      if ( newValue !== undefined ) {
        this.lastValue = this.model.get(this._dataBind) || false;
        this.model.set(this._dataBind, !!newValue);
      }
      else {
        return this.model.get(this._dataBind);
      }
    }

  });

  var RadioButton = Tango.RadioButton = function(dataBind, config, model) {
    this.initialize.apply(this, arguments);
  };

  _.extend(RadioButton.prototype, WidgetBase, {
    superclass: WidgetBase,

    initialize: function(dataBind, config, model) {
      this._radioValue = config.radioValue;
      config.containerClass = config.containerClass || 
                              Tango.styleConfig.radioOptionContainerClass;
      this.superclass.initialize.apply(this, [dataBind, config, model]);
    },

    _defaultCssClass: Tango.styleConfig.radioGroupClass,

    _createElement: function() {
      var selector = '[data-bind=' + this._dataBind + ']' +
                     '[value=' + this._radioValue + ']';

      var el = $(selector);
      if (el.length == 0) {
        var html = '<input type="radio" data-bind="'+ this._dataBind + 
                    '" value="'+ this._radioValue +'" />'
        this.el = $(html).appendTo(this._parent);
      }
      else {
        this.el = el;
      }

      // make sure the name is set properly
      this.el.prop('name', this._dataBind);
    },

    _elementChangeHandler: function(selector, widget) {
      var val = $(selector).prop('checked');
      this.value(val);
    },

    _modelChangeHandler: function(e) {
      var sameAsModel = (this.model.get(this._dataBind) === this._radioValue);
      if (!this.el.prop('checked') && sameAsModel) {
        this.el.prop('checked', true);
      }
    },

    _setInitialValue: function() {
      var initialValue = this.el.prop('checked');

      if(this.model.has(this._dataBind)){
        var modelVal = this.model.get(this._dataBind);
        initialValue = modelVal === this._radioValue;
        this.el.prop('checked', !!initialValue);
      }
      else {
        if (!!initialValue) {
          this.model.set(this._dataBind, this._radioValue);
        }
      }

      this.lastValue = initialValue;
    },

    value: function(newValue){
      if ( newValue !== undefined ) {
        this.lastValue = this.model.get(this._dataBind) || false;
        if (!!newValue) {
          this.model.set(this._dataBind, this._radioValue);
        }
      }
      else {
        return this.model.get(this._dataBind) === this._radioValue;
      }
    }

  });

  var RadioGroup = Tango.RadioGroup = function(dataBind, config, model) {
    this.initialize.apply(this, arguments);
  };

  _.extend(RadioGroup.prototype, WidgetBase, {
    superclass: WidgetBase,

    initialize: function(dataBind, config, model) {
      this.buttons = [];
      this._options = config.options;
      if (!this._options) { 
        throw new Error("Can't init RadioGroup without 'options'");
      }
      this.superclass.initialize.apply(this, arguments);
    },

    _createContainer: noop,

    _createElement: function() {
      var cssClass = this._config.containerClass 
                     || Tango.styleConfig.radioGroupClass;
      var id = _.uniqueId('tango-');
      var containerHtml = '<div class="' + cssClass + '" id="' + id + '">';

      // If there are the same number of options as elements
      var inputs = $('[data-bind=' + this._dataBind + ']');
      if (inputs.length == this._options.length) {
        // First, create radio group element
        this.el = this.containerEl = $(containerHtml).insertBefore(inputs[0]);
        this.el.append(inputs);
      }
      else if (inputs.length === 1) {
        // Consider it a single input "prototype"
        var input = inputs[0];
        this.el = this.containerEl = $(containerHtml).insertBefore(input);
        input.remove();
      }
      else if (inputs.length && (inputs.length !== this._options.length)) {
        var msg = "Bad config for RadioGroup. Number of elements " +
                  "with data-bind value must match the number of config.options";
        throw new Error(msg);
      }
      else {
        // Consider it a parent parent
        this.el = this.containerEl = $(containerHtml).appendTo(this._parent);
      }

      _.each(this._options, function(option) {
        var button =  new RadioButton(this._dataBind, {
          label: option[1],
          radioValue: option[0],
          parentSelector: '#' + id
        }, model);

        this.buttons.push(button);
      }, this);

    },

    _setInitialValue: function() {
      var initialValue = this.checkedOption()._radioValue;

      if(this.model.has(this._dataBind)){
        var modelVal = this.model.get(this._dataBind);
        initialValue = modelVal;
        this.button(modelVal).el.prop('checked', true);
      }
      else {
        this.model.set(this._dataBind, initialValue);
      }

      this.lastValue = initialValue;
    },


    _defaultCssClass: Tango.styleConfig.radioGroupClass,

    button: function(index) {
      if (_.isNumber(index)) {
        return this.buttons[index];
      }
      if (_.isString(index)) {
        var button = _.filter(this.buttons, function(b){
          return b._radioValue === index;
        });

        if (button.length) {
          return button[0];
        }
      }

      return undefined;
    },

    checkedOption: function() {
      var button = _.filter(this.buttons, function(b){
        return b.el.prop('checked');
      });

      return button;
    }


  });

  root.Tango = Tango;

})(this)

