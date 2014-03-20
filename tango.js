//define('myModule', 
    //['backbone', 'underscore', 'jquery'], 

    //function ( Backbone, _, $, exports  ) {

        //var Tango = {
            //doStuff:function(){
                //console.log('Yay! Stuff');
            //}
        //}

        //return Tango;
    //}
//);

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

      var el = $('[data-bind=' + dataBind + ']');
      if (el.length == []) {
        throw new Error("Couldn't find an input with the data-bind: " + dataBind);
      }
      else {
        this.el = el;
      }

      this.model = model;

      //if (!model) {
        //throw new Error("Can't initialize widget from empty model.");
      //}
      //else {
        //this.model = model;
      //}

      // Set the initial value
      var initialValue = this.el.val();
      if(model.has(dataBind)){
        initialValue = model.get(dataBind);
        this.el.val(initialValue);
      }
      else {
        model.set(dataBind, initialValue);
      }
      this.lastValue = initialValue;

      // Set the identifier for later use
      var id = this.el.attr('id');
      if (!id) {
        this.el.attr('id', _.uniqueId('tango-'));
      }

      // Create container
      this._createContainer();

      // Create a label if needed
      this._createLabel();

      // Add Styling
      this._applyStyling();

      // Handle visible and enabled for initial state
      modelChangeHandler.call(this, this._config.enableFn, this.enable, this.disable);
      modelChangeHandler.call(this, this._config.visibleFn, this.show, this.hide);

      // Handle global model change
      model.on("change", function() {
        modelChangeHandler.call(this, config.enableFn, this.enable, this.disable);
        modelChangeHandler.call(this, config.visibleFn, this.show, this.hide);
      }, this);

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
    }

  };

  function modelChangeHandler(fn, trueCb, falseCb) {
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

      // validate initial state.
      this._validate();

      /// Data binding
      // Wire model to widget 
      // Handle model changes to just this attribute
      var event = 'change:' + dataBind;
      model.on(event, function() {
        this.el.val(this.model.get(this._dataBind));
        this._validate();
      }, this);

      // Wire widget to model 
      var self = this;
      this.el.on('change', function(e){
        var val = $(this).val();
        self.value($(this).val());
      });

      this.el.on('keyup', function(e){
        var val = $(this).val();
        self.value($(this).val());
      });

      // if a match validator exists, re-validate when the target changes.
      if ( this._config.validate && this._config.validate.matches ) {
        var matchingEl = $('[data-bind=' + this._config.validate.matches.target + ']');
        matchingEl.keyup( $.proxy(this._validate, this) );
        matchingEl.on('change', $.proxy(this._validate, this) );
      }

    },

    _createLabel: function() {
      if (this._config.label) {
        var cssClass = Tango.styleConfig.labelClass;
        var forId = this.el.attr('id');
        var label = '<label for="' + forId + '" class="' + cssClass + '">'
                    + this._config.label + '</label>';
        this.labelEl = $(label).insertBefore(this.el);
      }
    },

    _createContainer: function() {
      var cssClass = Tango.styleConfig.containerClass;
      var id = _.uniqueId('tango-');
      var container = '<div class="' + cssClass + '" id="' + id + '">';
      var containerEl = $(container).insertBefore(this.el);
      containerEl.append(this.el);
      this.containerEl =  containerEl;
    },

    _applyStyling: function() {
      this.el.addClass(Tango.styleConfig.textInputClass);
    },

    _validateFunctions: [
      validateRequired,
      validateMinLength,
      validateMaxLength,
      validateNumber,
      validateFormat,
      validateMatches
    ],

    value: function(newValue){
      if ( newValue !== undefined ) {
        this.lastValue = this.model.get(this._dataBind) || "";
        this.model.set(this._dataBind, newValue);
      }
      else {
        return this.model.get(this._dataBind);
      }
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

  });

  root.Tango = Tango;

})(this)



