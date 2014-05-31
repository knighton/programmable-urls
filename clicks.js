// -----------------------------------------------------------------------------
// mouse buttons.

MouseButtons = {};

MouseButtons.LEFT = 0;
MouseButtons.MIDDLE = 1;
MouseButtons.RIGHT = 2;

MouseButtons.IE_LEFT = 1;
MouseButtons.IE_MIDDLE = 4;
MouseButtons.IE_RIGHT = 2;

MouseButtons.is_browser_le_ie8 = function() {
  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
    var vers = new Number(RegExp.$1);
    if (vers <= 8) {
      return true;
    }
  }
  return false;
};

// raw button -> canonicalized button.
MouseButtons.canonicalize_mouse_button = function(b) {
  // convert ie buttons.
  if (MouseButtons.is_browser_le_ie8()) {
    ie2canon = {};
    ie2canon[MouseButtons.IE_LEFT] = MouseButtons.LEFT;
    ie2canon[MouseButtons.IE_MIDDLE] = MouseButtons.MIDDLE;
    ie2canon[MouseButtons.IE_RIGHT] = MouseButtons.RIGHT;
    b = ie2canon[b]
  }

  return b;
};

// canonicalized button -> raw button.
MouseButtons.uncanonicalize_mouse_button = function(b) {
  // convert ie buttons.
  if (MouseButtons.is_browser_le_ie8()) {
    canon2ie = {};
    canon2ie[MouseButtons.LEFT] = MouseButtons.IE_LEFT;
    canon2ie[MouseButtons.MIDDLE] = MouseButtons.IE_MIDDLE;
    canon2ie[MouseButtons.RIGHT] = MouseButtons.IE_RIGHT;
    b = canon2ie[b];
  }

  return b;
};

// optional event -> canonicalized button.
MouseButtons.canonicalized_mouse_button_from_event = function(event) {
  if (typeof event === 'undefined') {
    var b = undefined;
  } else if (event === null) {
    var b = undefined;
  } else {
    var b = event.button;
  }

  return MouseButtons.canonicalize_mouse_button(b);
};

// -----------------------------------------------------------------------------
// clicks.

var Clicks = {};

Clicks.fake_click = function(clickee, canonical_button) {
  var b = MouseButtons.uncanonicalize_mouse_button(canonical_button);
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent(
      "click", true, true, window, 0, 0, 0, 0, 0, false, false, false,
      false, b, null);
  var allow_default = clickee.dispatchEvent(evt);
};

Clicks.spawn_new_tab = function(url) {
  var tmp = document.createElement('a');
  tmp.href = url;
  Clicks.fake_click(tmp, MouseButtons.MIDDLE);
};

Clicks.go_to_url = function(url) {
  window.location = url;
};

Clicks.clicked_link = function(event, url, on_left, on_middle) {
  event.stopPropagation();
  event.preventDefault();

  var b = MouseButtons.canonicalized_mouse_button_from_event(event);
  if (b == MouseButtons.LEFT) {
    if (on_left) {
      eval("var on_left = " + unescape(on_left));
      on_left(url);
    }
  } else if (b == MouseButtons.MIDDLE) {
    if (on_middle) {
      eval("var on_middle = " + unescape(on_middle));
      on_middle(url);
    }
  }

  return false;
};

Clicks.draw_link = function(url, content, on_left, on_middle) {
  url = "'" + url + "'";
  on_left = on_left ? "'" + escape(on_left) + "'" : null;
  on_middle = on_middle ? "'" + escape(on_middle) + "'" : null;
  var s = '<a';
  s += ' href="' + url + '"';
  s += ' onclick="return Clicks.clicked_link(event, ' + url + ', ' + on_left + ', ';
  s += on_middle + ')"';
  s += '>' + content + '</a>';
  return s;
};
