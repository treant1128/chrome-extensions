// Generated by CoffeeScript 1.8.0
(function() {
  var $, CheckBoxOption, ExclusionRulesOption, NonEmptyTextOption, NumberOption, Option, TextOption, activateHelpDialog, bgSettings, enableSaveButton, maintainLinkHintsView, toggleAdvancedOptions,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  $ = function(id) {
    return document.getElementById(id);
  };

  bgSettings = chrome.extension.getBackgroundPage().Settings;

  Option = (function() {
    Option.all = [];

    function Option(field, enableSaveButton) {
      this.field = field;
      this.element = $(this.field);
      this.element.addEventListener("change", enableSaveButton);
      this.fetch();
      Option.all.push(this);
    }

    Option.prototype.fetch = function() {
      this.populateElement(this.previous = bgSettings.get(this.field));
      return this.previous;
    };

    Option.prototype.save = function() {
      var value;
      value = this.readValueFromElement();
      if (!this.areEqual(value, this.previous)) {
        bgSettings.set(this.field, this.previous = value);
        return bgSettings.performPostUpdateHook(this.field, value);
      }
    };

    Option.prototype.areEqual = function(a, b) {
      return a === b;
    };

    Option.prototype.restoreToDefault = function() {
      bgSettings.clear(this.field);
      return this.fetch();
    };

    Option.saveOptions = function() {
      Option.all.map(function(option) {
        return option.save();
      });
      $("saveOptions").disabled = true;
      return $("saveOptions").innerHTML = "No Changes";
    };

    return Option;

  })();

  NumberOption = (function(_super) {
    __extends(NumberOption, _super);

    function NumberOption() {
      return NumberOption.__super__.constructor.apply(this, arguments);
    }

    NumberOption.prototype.populateElement = function(value) {
      return this.element.value = value;
    };

    NumberOption.prototype.readValueFromElement = function() {
      return parseFloat(this.element.value);
    };

    return NumberOption;

  })(Option);

  TextOption = (function(_super) {
    __extends(TextOption, _super);

    function TextOption(field, enableSaveButton) {
      TextOption.__super__.constructor.call(this, field, enableSaveButton);
      this.element.addEventListener("input", enableSaveButton);
    }

    TextOption.prototype.populateElement = function(value) {
      return this.element.value = value;
    };

    TextOption.prototype.readValueFromElement = function() {
      return this.element.value.trim();
    };

    return TextOption;

  })(Option);

  NonEmptyTextOption = (function(_super) {
    __extends(NonEmptyTextOption, _super);

    function NonEmptyTextOption(field, enableSaveButton) {
      NonEmptyTextOption.__super__.constructor.call(this, field, enableSaveButton);
      this.element.addEventListener("input", enableSaveButton);
    }

    NonEmptyTextOption.prototype.populateElement = function(value) {
      return this.element.value = value;
    };

    NonEmptyTextOption.prototype.readValueFromElement = function() {
      var value;
      if (value = this.element.value.trim()) {
        return value;
      } else {
        return this.restoreToDefault();
      }
    };

    return NonEmptyTextOption;

  })(Option);

  CheckBoxOption = (function(_super) {
    __extends(CheckBoxOption, _super);

    function CheckBoxOption() {
      return CheckBoxOption.__super__.constructor.apply(this, arguments);
    }

    CheckBoxOption.prototype.populateElement = function(value) {
      return this.element.checked = value;
    };

    CheckBoxOption.prototype.readValueFromElement = function() {
      return this.element.checked;
    };

    return CheckBoxOption;

  })(Option);

  ExclusionRulesOption = (function(_super) {
    __extends(ExclusionRulesOption, _super);

    function ExclusionRulesOption() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ExclusionRulesOption.__super__.constructor.apply(this, args);
      $("exclusionAddButton").addEventListener("click", (function(_this) {
        return function(event) {
          var exclusionScrollBox;
          _this.appendRule({
            pattern: "",
            passKeys: ""
          });
          _this.element.children[_this.element.children.length - 1].children[0].children[0].focus();
          exclusionScrollBox = $("exclusionScrollBox");
          return exclusionScrollBox.scrollTop = exclusionScrollBox.scrollHeight;
        };
      })(this));
    }

    ExclusionRulesOption.prototype.populateElement = function(rules) {
      var rule, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = rules.length; _i < _len; _i++) {
        rule = rules[_i];
        _results.push(this.appendRule(rule));
      }
      return _results;
    };

    ExclusionRulesOption.prototype.appendRule = function(rule) {
      var content, element, event, field, remove, row, _i, _j, _len, _len1, _ref, _ref1;
      content = document.querySelector('#exclusionRuleTemplate').content;
      row = document.importNode(content, true);
      _ref = ["pattern", "passKeys"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        element = row.querySelector("." + field);
        element.value = rule[field];
        _ref1 = ["input", "change"];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          event = _ref1[_j];
          element.addEventListener(event, enableSaveButton);
        }
      }
      remove = row.querySelector(".exclusionRemoveButton");
      remove.addEventListener("click", (function(_this) {
        return function(event) {
          row = event.target.parentNode.parentNode;
          row.parentNode.removeChild(row);
          return enableSaveButton();
        };
      })(this));
      return this.element.appendChild(row);
    };

    ExclusionRulesOption.prototype.readValueFromElement = function() {
      var element, passKeys, pattern, rules;
      rules = (function() {
        var _i, _len, _ref, _results;
        _ref = this.element.getElementsByClassName("exclusionRuleTemplateInstance");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          element = _ref[_i];
          pattern = element.children[0].firstChild.value.trim();
          passKeys = element.children[1].firstChild.value.trim();
          _results.push({
            pattern: pattern,
            passKeys: passKeys
          });
        }
        return _results;
      }).call(this);
      return rules.filter(function(rule) {
        return rule.pattern;
      });
    };

    ExclusionRulesOption.prototype.areEqual = function(a, b) {
      var flatten;
      flatten = function(rule) {
        if (rule && rule.pattern) {
          return rule.pattern + "\n" + rule.passKeys;
        } else {
          return "";
        }
      };
      return a.map(flatten).join("\n") === b.map(flatten).join("\n");
    };

    return ExclusionRulesOption;

  })(Option);

  enableSaveButton = function() {
    $("saveOptions").removeAttribute("disabled");
    return $("saveOptions").innerHTML = "Save Changes";
  };

  maintainLinkHintsView = function() {
    var hide, show;
    hide = function(el) {
      return el.parentNode.parentNode.style.display = "none";
    };
    show = function(el) {
      return el.parentNode.parentNode.style.display = "table-row";
    };
    if ($("filterLinkHints").checked) {
      hide($("linkHintCharacters"));
      return show($("linkHintNumbers"));
    } else {
      show($("linkHintCharacters"));
      return hide($("linkHintNumbers"));
    }
  };

  toggleAdvancedOptions = (function(advancedMode) {
    return function(event) {
      if (advancedMode) {
        $("advancedOptions").style.display = "none";
        $("advancedOptionsLink").innerHTML = "Show advanced options&hellip;";
      } else {
        $("advancedOptions").style.display = "table-row-group";
        $("advancedOptionsLink").innerHTML = "Hide advanced options";
      }
      advancedMode = !advancedMode;
      event.preventDefault();
      return document.activeElement.blur();
    };
  })(false);

  activateHelpDialog = function() {
    showHelpDialog(chrome.extension.getBackgroundPage().helpDialogHtml(true, true, "Command Listing"), frameId);
    return document.activeElement.blur();
  };

  document.addEventListener("DOMContentLoaded", function() {
    var element, name, type, _i, _len, _ref, _ref1;
    _ref = {
      exclusionRules: ExclusionRulesOption,
      filterLinkHints: CheckBoxOption,
      hideHud: CheckBoxOption,
      keyMappings: TextOption,
      linkHintCharacters: NonEmptyTextOption,
      linkHintNumbers: NonEmptyTextOption,
      newTabUrl: NonEmptyTextOption,
      nextPatterns: NonEmptyTextOption,
      previousPatterns: NonEmptyTextOption,
      regexFindMode: CheckBoxOption,
      scrollStepSize: NumberOption,
      smoothScroll: CheckBoxOption,
      searchEngines: TextOption,
      searchUrl: NonEmptyTextOption,
      userDefinedLinkHintCss: TextOption
    };
    for (name in _ref) {
      type = _ref[name];
      new type(name, enableSaveButton);
    }
    $("saveOptions").addEventListener("click", Option.saveOptions);
    $("advancedOptionsLink").addEventListener("click", toggleAdvancedOptions);
    $("showCommands").addEventListener("click", activateHelpDialog);
    $("filterLinkHints").addEventListener("click", maintainLinkHintsView);
    _ref1 = document.getElementsByClassName("nonEmptyTextOption");
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      element = _ref1[_i];
      element.className = element.className + " example info";
      element.innerHTML = "Leave empty to reset this option.";
    }
    maintainLinkHintsView();
    window.onbeforeunload = function() {
      if (!$("saveOptions").disabled) {
        return "You have unsaved changes to options.";
      }
    };
    return document.addEventListener("keyup", function(event) {
      var _ref2;
      if (event.ctrlKey && event.keyCode === 13) {
        if (typeof document !== "undefined" && document !== null ? (_ref2 = document.activeElement) != null ? _ref2.blur : void 0 : void 0) {
          document.activeElement.blur();
        }
        return Option.saveOptions();
      }
    });
  });

}).call(this);
