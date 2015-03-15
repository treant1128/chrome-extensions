// Generated by CoffeeScript 1.8.0
(function() {
  var BackgroundCompleter, Vomnibar, VomnibarUI, root;

  Vomnibar = {
    vomnibarUI: null,
    completers: {},
    getCompleter: function(name) {
      if (!(name in this.completers)) {
        this.completers[name] = new BackgroundCompleter(name);
      }
      return this.completers[name];
    },
    activateWithCompleter: function(completerName, refreshInterval, initialQueryValue, selectFirstResult, forceNewTab) {
      var completer;
      completer = this.getCompleter(completerName);
      if (!this.vomnibarUI) {
        this.vomnibarUI = new VomnibarUI();
      }
      completer.refresh();
      this.vomnibarUI.setInitialSelectionValue(selectFirstResult ? 0 : -1);
      this.vomnibarUI.setCompleter(completer);
      this.vomnibarUI.setRefreshInterval(refreshInterval);
      this.vomnibarUI.setForceNewTab(forceNewTab);
      this.vomnibarUI.show();
      if (initialQueryValue) {
        this.vomnibarUI.setQuery(initialQueryValue);
        return this.vomnibarUI.update();
      }
    },
    activate: function() {
      return this.activateWithCompleter("omni", 100);
    },
    activateInNewTab: function() {
      return this.activateWithCompleter("omni", 100, null, false, true);
    },
    activateTabSelection: function() {
      return this.activateWithCompleter("tabs", 0, null, true);
    },
    activateBookmarks: function() {
      return this.activateWithCompleter("bookmarks", 0, null, true);
    },
    activateBookmarksInNewTab: function() {
      return this.activateWithCompleter("bookmarks", 0, null, true, true);
    },
    activateEditUrl: function() {
      return this.activateWithCompleter("omni", 100, window.location.href);
    },
    activateEditUrlInNewTab: function() {
      return this.activateWithCompleter("omni", 100, window.location.href, false, true);
    },
    getUI: function() {
      return this.vomnibarUI;
    }
  };

  VomnibarUI = (function() {
    function VomnibarUI() {
      this.refreshInterval = 0;
      this.initDom();
    }

    VomnibarUI.prototype.setQuery = function(query) {
      return this.input.value = query;
    };

    VomnibarUI.prototype.setInitialSelectionValue = function(initialSelectionValue) {
      return this.initialSelectionValue = initialSelectionValue;
    };

    VomnibarUI.prototype.setCompleter = function(completer) {
      this.completer = completer;
      return this.reset();
    };

    VomnibarUI.prototype.setRefreshInterval = function(refreshInterval) {
      return this.refreshInterval = refreshInterval;
    };

    VomnibarUI.prototype.setForceNewTab = function(forceNewTab) {
      return this.forceNewTab = forceNewTab;
    };

    VomnibarUI.prototype.show = function() {
      this.box.style.display = "block";
      this.input.focus();
      return this.handlerId = handlerStack.push({
        keydown: this.onKeydown.bind(this)
      });
    };

    VomnibarUI.prototype.hide = function() {
      this.box.style.display = "none";
      this.completionList.style.display = "none";
      this.input.blur();
      return handlerStack.remove(this.handlerId);
    };

    VomnibarUI.prototype.reset = function() {
      this.input.value = "";
      this.updateTimer = null;
      this.completions = [];
      this.selection = this.initialSelectionValue;
      return this.update(true);
    };

    VomnibarUI.prototype.updateSelection = function() {
      var i, _i, _ref;
      if (this.completions[0]) {
        if (this.previousCompletionType !== "search" && this.completions[0].type === "search") {
          this.selection = 0;
        } else if (this.previousCompletionType === "search" && this.completions[0].type !== "search") {
          this.selection = -1;
        }
      }
      for (i = _i = 0, _ref = this.completionList.children.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.completionList.children[i].className = (i === this.selection ? "vomnibarSelected" : "");
      }
      if (this.completions[0]) {
        return this.previousCompletionType = this.completions[0].type;
      }
    };

    VomnibarUI.prototype.actionFromKeyEvent = function(event) {
      var key;
      key = KeyboardUtils.getKeyChar(event);
      if (KeyboardUtils.isEscape(event)) {
        return "dismiss";
      } else if (key === "up" || (event.shiftKey && event.keyCode === keyCodes.tab) || (event.ctrlKey && (key === "k" || key === "p"))) {
        return "up";
      } else if (key === "down" || (event.keyCode === keyCodes.tab && !event.shiftKey) || (event.ctrlKey && (key === "j" || key === "n"))) {
        return "down";
      } else if (event.keyCode === keyCodes.enter) {
        return "enter";
      }
    };

    VomnibarUI.prototype.onKeydown = function(event) {
      var action, openInNewTab, query;
      action = this.actionFromKeyEvent(event);
      if (!action) {
        return true;
      }
      openInNewTab = this.forceNewTab || (event.shiftKey || event.ctrlKey || KeyboardUtils.isPrimaryModifierKey(event));
      if (action === "dismiss") {
        this.hide();
      } else if (action === "up") {
        this.selection -= 1;
        if (this.selection < this.initialSelectionValue) {
          this.selection = this.completions.length - 1;
        }
        this.input.value = this.completions[this.selection].url;
        this.updateSelection();
      } else if (action === "down") {
        this.selection += 1;
        if (this.selection === this.completions.length) {
          this.selection = this.initialSelectionValue;
        }
        this.input.value = this.completions[this.selection].url;
        this.updateSelection();
      } else if (action === "enter") {
        if (this.selection === -1) {
          query = this.input.value.trim();
          if (!(0 < query.length)) {
            return;
          }
          this.hide();
          chrome.runtime.sendMessage({
            handler: openInNewTab ? "openUrlInNewTab" : "openUrlInCurrentTab",
            url: query
          });
        } else {
          this.update(true, (function(_this) {
            return function() {
              _this.completions[_this.selection].performAction(openInNewTab);
              return _this.hide();
            };
          })(this));
        }
      }
      DomUtils.suppressPropagation(event);
      event.preventDefault();
      return true;
    };

    VomnibarUI.prototype.updateCompletions = function(callback) {
      var query;
      query = this.input.value.trim();
      return this.completer.filter(query, (function(_this) {
        return function(completions) {
          _this.completions = completions;
          _this.populateUiWithCompletions(completions);
          if (callback) {
            return callback();
          }
        };
      })(this));
    };

    VomnibarUI.prototype.populateUiWithCompletions = function(completions) {
      this.completionList.innerHTML = completions.map(function(completion) {
        return "<li>" + completion.html + "</li>";
      }).join("");
      this.completionList.style.display = completions.length > 0 ? "block" : "none";
      this.selection = Math.min(Math.max(this.initialSelectionValue, this.selection), this.completions.length - 1);
      return this.updateSelection();
    };

    VomnibarUI.prototype.update = function(updateSynchronously, callback) {
      if (updateSynchronously) {
        if (this.updateTimer !== null) {
          window.clearTimeout(this.updateTimer);
        }
        return this.updateCompletions(callback);
      } else if (this.updateTimer !== null) {

      } else {
        return this.updateTimer = setTimeout((function(_this) {
          return function() {
            _this.updateCompletions(callback);
            return _this.updateTimer = null;
          };
        })(this), this.refreshInterval);
      }
    };

    VomnibarUI.prototype.initDom = function() {
      this.box = Utils.createElementFromHtml("<div id=\"vomnibar\" class=\"vimiumReset\">\n  <div class=\"vimiumReset vomnibarSearchArea\">\n    <input type=\"text\" class=\"vimiumReset\">\n  </div>\n  <ul class=\"vimiumReset\"></ul>\n</div>");
      this.box.style.display = "none";
      document.body.appendChild(this.box);
      this.input = document.querySelector("#vomnibar input");
      this.input.addEventListener("input", (function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
      this.completionList = document.querySelector("#vomnibar ul");
      return this.completionList.style.display = "none";
    };

    return VomnibarUI;

  })();

  BackgroundCompleter = (function() {
    function BackgroundCompleter(name) {
      this.name = name;
      this.filterPort = chrome.runtime.connect({
        name: "filterCompleter"
      });
    }

    BackgroundCompleter.prototype.refresh = function() {
      return chrome.runtime.sendMessage({
        handler: "refreshCompleter",
        name: this.name
      });
    };

    BackgroundCompleter.prototype.filter = function(query, callback) {
      var id;
      id = Utils.createUniqueId();
      this.filterPort.onMessage.addListener((function(_this) {
        return function(msg) {
          var results;
          _this.filterPort.onMessage.removeListener(arguments.callee);
          results = msg.results.map(function(result) {
            var functionToCall;
            functionToCall = result.type === "tab" ? BackgroundCompleter.completionActions.switchToTab.curry(result.tabId) : BackgroundCompleter.completionActions.navigateToUrl.curry(result.url);
            result.performAction = functionToCall;
            return result;
          });
          return callback(results);
        };
      })(this));
      return this.filterPort.postMessage({
        id: id,
        name: this.name,
        query: query
      });
    };

    return BackgroundCompleter;

  })();

  extend(BackgroundCompleter, {
    completionActions: {
      navigateToUrl: function(url, openInNewTab) {
        var script;
        if (url.startsWith("javascript:")) {
          script = document.createElement('script');
          script.textContent = decodeURIComponent(url.slice("javascript:".length));
          return (document.head || document.documentElement).appendChild(script);
        } else {
          return chrome.runtime.sendMessage({
            handler: openInNewTab ? "openUrlInNewTab" : "openUrlInCurrentTab",
            url: url,
            selected: openInNewTab
          });
        }
      },
      switchToTab: function(tabId) {
        return chrome.runtime.sendMessage({
          handler: "selectSpecificTab",
          id: tabId
        });
      }
    }
  });

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Vomnibar = Vomnibar;

}).call(this);
