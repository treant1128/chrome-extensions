// Generated by CoffeeScript 1.8.0
(function() {
  var root;

  root = window.Marks = {};

  root.activateCreateMode = function() {
    return handlerStack.push({
      keydown: function(e) {
        var baseLocation, hash, keyChar, sep, _ref;
        keyChar = KeyboardUtils.getKeyChar(event);
        if (keyChar === "") {
          return;
        }
        if (/[A-Z]/.test(keyChar)) {
          chrome.runtime.sendMessage({
            handler: 'createMark',
            markName: keyChar,
            scrollX: window.scrollX,
            scrollY: window.scrollY
          }, function() {
            return HUD.showForDuration("Created global mark '" + keyChar + "'", 1000);
          });
        } else if (/[a-z]/.test(keyChar)) {
          _ref = window.location.href.split('#'), baseLocation = _ref[0], sep = _ref[1], hash = _ref[2];
          localStorage["vimiumMark|" + baseLocation + "|" + keyChar] = JSON.stringify({
            scrollX: window.scrollX,
            scrollY: window.scrollY
          });
          HUD.showForDuration("Created local mark '" + keyChar + "'", 1000);
        }
        this.remove();
        return false;
      }
    });
  };

  root.activateGotoMode = function() {
    return handlerStack.push({
      keydown: function(e) {
        var baseLocation, hash, keyChar, mark, markString, sep, _ref;
        keyChar = KeyboardUtils.getKeyChar(event);
        if (keyChar === "") {
          return;
        }
        if (/[A-Z]/.test(keyChar)) {
          chrome.runtime.sendMessage({
            handler: 'gotoMark',
            markName: keyChar
          });
        } else if (/[a-z]/.test(keyChar)) {
          _ref = window.location.href.split('#'), baseLocation = _ref[0], sep = _ref[1], hash = _ref[2];
          markString = localStorage["vimiumMark|" + baseLocation + "|" + keyChar];
          if (markString != null) {
            mark = JSON.parse(markString);
            window.scrollTo(mark.scrollX, mark.scrollY);
            HUD.showForDuration("Jumped to local mark '" + keyChar + "'", 1000);
          }
        }
        this.remove();
        return false;
      }
    });
  };

}).call(this);
