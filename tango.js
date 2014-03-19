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

  var styleConf = {
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
    maxValErr: "Value must be less than: <%= maxValue %>."

  };

  // Helper Functions
  function createLabel(el, text) {
    var cssClass = styleConf.labelClass;
    var forId = el.attr('id');
    var label = '<label for="' + forId + '" class="' + cssClass + '">'
                + text + '</label>';
    return $(label).insertBefore(el);
  }

  function createContainer(el) {
    var cssClass = styleConf.containerClass;
    var id = _.uniqueId('tango-');
    var container = '<div class="' + cssClass + '" id="' + id + '">';
    var containerEl = $(container).insertBefore(el);
    containerEl.append(el);
    return containerEl;
  }

  function toggleErrorClass(el, containerEl, errors){
    var valid = errors.length === 0;
    var errorClass = styleConf.errorClass;
    if(valid) {
      containerEl.removeClass(errorClass);
    }
    else {
      containerEl.addClass(errorClass);
    }
  }

  var TextInput = Tango.TextInput = function(dataBind, config, model) {
    var self = this;
    self.errors = [];
    self._dataBind = dataBind;
    self._config = (config || {});

    var el = $('[data-bind=' + dataBind + ']');
    if (el.length == []) {
      throw new Error("Couldn't find an input with the data-bind: " + dataBind);
    }
    else {
      self.el = el;
    }

    if (!model) {
      throw new Error("Can't initialize widget from empty model.");
    }
    else {
      self.model = model;
    }

    // Set the initial value
    var initialValue = el.val();
    if(model.has(dataBind)){
      initialValue = model.get(dataBind);
      el.val(initialValue);
    }
    else {
      model.set(dataBind, initialValue);
    }
    self.lastValue = initialValue;

    // Set the identifier for later use
    var id = el.attr('id');
    if (!id) {
      el.attr('id', _.uniqueId('tango-'));
    }

    // Create container
    self.containerEl = createContainer(el);

    // Add Styling
    el.addClass(styleConf.textInputClass);

    // Create a label if needed
    if (self._config.label) {
      self.labelEl = createLabel(el, self._config.label);
    }

    // validate initial state.
    self._validate();

    /// Data binding
    // Wire model to widget 
    // Handle model changes to just this attribute
    var event = 'change:' + dataBind;
    model.on(event, function() {
      el.val(self.model.get(self._dataBind));

      // Re-validate
      self._validate();
    }, self);


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

    // Handle visible and enabled for initial state
    modelChangeHandler.call(self, self._config.enableFn, self.enable, self.disable);
    modelChangeHandler.call(self, self._config.visibleFn, self.show, self.hide);

    // Handle global model change
    model.on("change", function() {
      modelChangeHandler.call(self, config.enableFn, self.enable, self.disable);
      modelChangeHandler.call(self, config.visibleFn, self.show, self.hide);
    }, self);

    // Wire widget to model 
    function inputChangeHandler(event){
      self._validate();
      var val = $(this).val();
      self.value($(this).val());
    };

    el.on('change', inputChangeHandler);
    el.on('keyup', inputChangeHandler);

    // if a match validator exists, re-validate when the target changes.
    if ( self._config.validate && self._config.validate.matches ) {
      var matchingEl = $('[data-bind=' + self._config.validate.matches.target + ']');
      matchingEl.keyup( $.proxy(self._validate, self) );
      matchingEl.on('change', $.proxy(self._validate, self) );
    }

  };

  _.extend(TextInput.prototype, {

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
      // Don't use self.value so that the lastValue is reset as well.
      this.model.set(this.dataBind, this.lastValue);
    },

    modified: function() {
      return this.value() !== this.lastValue;
    },

    isValid: function(){
      return this.errors.length == 0;
    },

    _validate: function(){
      if (!this._config.validate) {
        return;
      }

      var errors = [];
      var val = this.el.val();
      var conf = this._config.validate;

      // Required
      if (conf.required) {
        if (!val) {
          var errMsg = styleConf.requiredErr;
          errors.push(errMsg);
        }
      }

      // Max Length
      if (conf.maxLength) {
        if (val.length > conf.maxLength){
          var templateData = {maxLength: conf.maxLength}
          var errMsg = _.template(styleConf.maxLenErr, templateData);
          errors.push(errMsg);
        }
      }

      // Min Length
      if (conf.minLength) {
        if (val.length < conf.minLength){
          var templateData = {maxLength: conf.minLength}
          var errMsg = _.template(styleConf.minLenErr, templateData);
          errors.push(errMsg);
        }
      }

      // Numbers
      var numberSpec = conf.number;
      if (numberSpec) {
        var isNumber = $.isNumeric(val);

        if (val && !isNumber){
          errors.push(styleConf.numberErr);
        }

        // If a number validation spec was specified, check for min/max, etc.
        // number: { min: 20, max: 40 }
        if(val && _.isObject(numberSpec) && isNumber){
          var numberValue = parseFloat(val) || parseInt(val);

          if(numberSpec.minValue && numberValue < numberSpec.minValue) {
            var templateData = {minValue: numberSpec.minValue}
            var errMsg = _.template(styleConf.minValErr, templateData);
            errors.push(errMsg);
          }

          if(numberSpec.maxValue && numberValue > numberSpec.maxValue) {
            var templateData = {maxValue: numberSpec.maxValue}
            var errMsg = _.template(styleConf.maxValErr, templateData);
            errors.push(errMsg);
          }
        }
      }

      // Format
      if (conf.format) {
        var regex = conf.format.regex;

        if (val && regex && !regex.exec(val)){
          if (conf.format.errorMsg) {
            errors.push(conf.format.errorMsg);
          }
          else {
            errors.push("Invalid format.");
          }
        }
      }

      // Matches
      if (conf.matches) {
        var matchingEl = $('[data-bind=' + conf.matches.target + ']');

        if (!!matchingEl.length) {
          if ( val && !(val === matchingEl.val()) ){
            if (conf.matches.errorMsg) {
              errors.push(conf.matches.errorMsg);
            }
            else {
              errors.push("Confirmation must match.");
            }
          }
        }
        else {
          log('Invalid target for match validator: ' + conf.matches.target);
        }
      }

      toggleErrorClass(this.el, this.containerEl, errors);
      this.errors = errors;
    }

  });


  root.Tango = Tango;

})(this)



