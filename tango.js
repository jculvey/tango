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

  function attachRequiredValidator(el, containerEl) {
    el.on('change', function handler(event){
      var val = $(this).val();
      var errorClass = styleConf.errorClass;
      if(!val) {
        containerEl.addClass(errorClass);
      }
      else {
        containerEl.removeClass(errorClass);
      }
    });
  }

  function toggleErrorClass(el, containerEl, isValid){
    var errorClass = styleConf.errorClass;
    if(isValid) {
      containerEl.removeClass(errorClass);
    }
    else {
      containerEl.addClass(errorClass);
    }
  }

  function validate(val, conf) {
    var errors = [];

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

    return errors;
  }

  var TextInput = Tango.TextInput = function(dataBind, config, model) {
    var self = this;
    self.dataBind = dataBind;
    self.valid = true;
    self.errors = [];
    config || (config = {});

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
    if (config.label) {
      self.labelEl = createLabel(el, config.label);
    }

    // validate initial state.
    if (config.validate) {
      self.errors = validate(el.val(), config.validate);
      self.valid = self.errors.length === 0;
      toggleErrorClass(self.el, self.containerEl, !self.errors.length);
    }

    /// Data binding
    // Wire model to widget 
    // Handle model changes to just this attribute
    var event = 'change:' + dataBind;
    model.on(event, function() {
      el.val(self.model.get(self.dataBind));
    }, self);

    // Handle global model change
    model.on("change", function() {
      console.log('model change');

      // enabled
      if (config.enableFn) {
        var cond = config.enableFn(self.model);
        if (cond) {
          self.enable();
        }
        else {
          self.disable();
        }
      }

      // visible
      if (config.visibleFn) {
        var cond = config.visibleFn(self.model);
        if (cond) {
          self.show();
        }
        else {
          self.hide();
        }
      }

    }, self);


    // Wire widget to model 
    el.on('change', function inputChangeHandler(event){
      console.log('change');
      var val = $(this).val();

      if ( config.validate ) {
        self.errors = validate(val, config.validate);
        self.valid = self.errors.length === 0;
        toggleErrorClass(self.el, self.containerEl, !self.errors.length);
      }

      self.value($(this).val());
    });

    el.on('input', function() {
      console.log('input');
    });

    el[0].onchange = function() {
      console.log('node change');
    };

    // if a match validator exists, re-validate when the target changes.
    if ( config.validate && config.validate.matches ) {
      var matchingEl = $('[data-bind=' + config.validate.matches.target + ']');

      matchingEl.on('change', function() {
        var val = self.el.val();
        self.errors = validate(val, config.validate);
        self.valid = self.errors.length === 0;
        toggleErrorClass(self.el, self.containerEl, !self.errors.length);
      });
    }

    /// Add functions
    self.value = function(newValue){
      if ( newValue !== undefined ) {
        self.lastValue = self.model.get(self.dataBind) || "";
        self.model.set(self.dataBind, newValue);
      }
      else {
        return self.model.get(self.dataBind);
      }
    };

    self.show = function(){
      self.containerEl.show();
    };

    self.hide = function(){
      self.containerEl.hide();
    };

    self.enable = function(){
      self.el.prop('disabled', false);
    };

    self.disable = function(){
      self.el.prop('disabled', true);
    };

    self.reset = function(){
      // Don't use self.value so that the lastValue is reset as well.
      self.model.set(self.dataBind, self.lastValue);
    };

    self.modified = function() {
      return self.value() !== self.lastValue;
    }

  };

  root.Tango = Tango;

})(this)



