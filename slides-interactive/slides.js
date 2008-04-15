// Global object that stores the current state of the slide show.
var slideManager = {
  // Slide controls
  controls: null,
  // Index of the active slide
  active: null,
  // Node holding the title of the active slide
  title: null,
  // Node holding the text of the active slide
  text: null,
  // Field holding the sample and live code nodes
  code: {
    // Node holding the sample code
    sample: null,
    // Node holding the live code
    live: null,
    // The text area filled with live code
    editor: null
  },
  // Central node for large messages.
  center: null,
  // Node holding the footer.
  footer: null
};

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

function purgeNode(node) {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
}

function trim(text) {
  if (text.charAt(text.length) == '\n') {
    return text.substr(0, text.length - 1);
  }
  return text;
}

function getBounds(id) {
  var node = e(id);
  var bounds = {x: 0, y: 0, width: 0, height: 0};
  if (node) {
    bounds.width = node.offsetWidth;
    bounds.height = node.offsetHeight;
    while (node && node.tagName != 'BODY') {
      bounds.x += node.offsetLeft;
      bounds.y += node.offsetTop;
      node = node.parentNode;
    }
  }
  return bounds;
}

function el(id) {
  return document.getElementById(id);
}

function setVisible(node, visible, opt_display) {
  if (visible) {
    node.style.visibility = "visible";
    node.style.display = opt_display || "block";
  } else {
    node.style.visibility = "hidden";
    node.style.display = "none";
  }
}

function setLocation(node, x, y) {
  node.style.left = x + "px";
  node.style.top = y + "px";
}

function setSize(node, width, height) {
  node.style.width = width + "px";
  node.style.height = height + "px";
}

function setZIndex(node, value) {
  node.style.zIndex = value;
}

function toSafeHtml(text) {
  var buffer = [];
  for (var i = 0; i < text.length; ++i) {
    var c = text.charAt(i);
    switch (c) {
      case '<': buffer.push("&lt;"); break;
      case '>': buffer.push("&gt;"); break;
      case '&': buffer.push("&amp;"); break;
      case '"': buffer.push("&quot;"); break;
      default: buffer.push(c); break;
    }
  }
  return buffer.join("");
}

// -----------------------------------------------------------------------------
// Slide functions
// -----------------------------------------------------------------------------

function startSlideShow() {
  window.setTimeout(startSlideShowInternal, 0);
}

function startSlideShowInternal() {
  if (!window.SLIDES) {
    return;
  }
  slideManager.controls = el("slidecontrols");
  if (!slideManager.controls) {
    return;
  }
  slideManager.title = el("title");
  slideManager.text = el("points");
  slideManager.code.live = el("livecode");
  slideManager.code.sample = el("samplecode");
  slideManager.code.editor = el("editor");
  slideManager.footer = el("footer");
  slideManager.center = el("central");

  GEvent.addDomListener(el("text"), "click", function() {
    slideManager.text.style.display = "";
  });

  // Create slide controls that allow us to advance from slide to slide.
  var prev = document.createElement("div");
  prev.className = "prevnext";
  prev.setAttribute("onclick", "showPrevSlide()");
  prev.innerHTML = "<img src='images/left-arrow.png' alt='<' " +
      "height='10' width='4' style='margin: 0px auto;' />";
  slideManager.controls.appendChild(prev);
  for (var i in SLIDES) {
    var page = SLIDES[i];
    var slideDot = document.createElement("div");
    slideDot.className = "slidedot";
    slideDot.innerHTML = SLIDES[i].title;
    slideDot.setAttribute("onclick", "showSlide(" + i + ")");
    slideDot.setAttribute("title", SLIDES[i].title || ("Slide " + (i + 1)));
    slideDot.setAttribute("id", "__dot" + i);
    slideManager.controls.appendChild(slideDot);
  }
  var next = document.createElement("div");
  next.className = "prevnext";
  next.setAttribute("onclick", "showNextSlide()");
  next.innerHTML = "<img src='images/right-arrow.png' alt='>' " +
      "height='10' width='4' style='margin: 0px auto;' />";
  slideManager.controls.appendChild(next);

  // Show first slide.
  showSlide(slideManager.active || 0);
}

function showSlide(index) {
  if (typeof slideManager.active == 'number') {
    hideSlide(slideManager.active);
    slideManager.active = null;
  }
  setupSlide(index);
}

function hideSlide(index) {
  var slide = SLIDES[index];
  if (slideManager.title) {
    purgeNode(slideManager.title);
  }
  if (slideManager.text) {
    purgeNode(slideManager.text);
  }
  if (slideManager.editor) {
    slideManager.code.value = "";
  }
  if (slide.onunload) {
    try {
      eval(slide.onunload);
    } catch (e) {
      alert(e);
    }
  }
  el("__dot" + index).className = "slidedot";
}

function setupSlide(index) {
  var slide = SLIDES[index];
  if (!slide) {
    return;
  }
  el("__dot" + index).className += " slidedot-active";
  if (slideManager.title && slide.title) {
    slideManager.title.appendChild(
        document.createTextNode(index + ". " + slide.title));
  }
  if (slideManager.text && slide.text) {
    loadHtmlContent(slideManager.text, slide.text);
  }
  if (slideManager.center && slide.center) {
    loadHtmlContent(slideManager.center, slide.center);
  }
  if (slide.code) {
    var ro = slide.code.indexOf(":readonly");
    if (ro == slide.code.length - ":readonly".length) {
      loadSampleCode(slideManager.code.sample, slide.code.substr(0, ro));
    } else {
      loadLiveCode(slideManager.code.editor, slide.code);
    }
  }
  if (slideManager.footer && slide.footer) {
    purgeNode(slideManager.footer);
    slideManager.footer.innerHTML = slide.footer;
  }
  if (slide.script) {
    for (var i in slide.script) {
      var oldscript = el("__s_" + index + "_" + i);
      if (!oldscript) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.setAttribute("id", "__s_" + index + "_" + i);
        document.body.appendChild(script);
        script.src = slide.script[i];
      }
    }
  }
  hideWarning();
  if (slide.onload) {
    try {
      eval(slide.onload);
    } catch (e) {
      alert(e);
    }
  }
  slideManager.active = index;
  slideManager.controls.focus();
}

function loadHtmlContent(node, url) {
  GDownloadUrl(url, function(text) {
    node.innerHTML = text;
  });
}

function loadLiveCode(textarea, url) {
  GDownloadUrl(url, function(text) {
    hideSampleCode();
    showActiveCode();
    textarea.value = text;
    window.setTimeout(function() {
      if (textarea.setSelectionRange) {
        textarea.setSelectionRange(0, 0);
      }
    }, 0);
  });
}

function loadSampleCode(node, url) {
  GDownloadUrl(url, function(text) {
    hideActiveCode();
    showSampleCode();
    node.innerHTML = "<pre class='prettyprint'>" +
      toSafeHtml(text) + "</pre>";
    window.setTimeout(prettyPrint, 0);
  });
}

function hideCentral() {
  var central = el("central");
  if (central) {
    setVisible(central, false);
  }
}

function showCentral() {
  var central = el("central");
  if (central) {
    setVisible(central, true);
  }
}

function hideContent() {
  var content = el("content");
  if (content) {
    setVisible(content, false);
  }
}

function showContent() {
  var content = el("content");
  if (content) {
    setVisible(content, true);
  }
}

function handleSlideKeys(event) {
  event = event || window.event;
  // 39 == right arrow, 32 == space
  if (event.keyCode == 39 || event.keyCode == 32) {
    showNextSlide();
  // 37 == left arrow, 8 == backspace
  } else if (event.keyCode == 37 || event.keyCode == 8) {
    showPrevSlide();
  }
}

function showNextSlide() {
  if (typeof slideManager.active == 'number') {
    if (slideManager.active < SLIDES.length - 1) {
      showSlide(slideManager.active + 1);
    }
  } else {
    showSlide(1);
  }
}

function showPrevSlide() {
  if (typeof slideManager.active == 'number' &&
      slideManager.active > 0) {
    showSlide(slideManager.active - 1);
  } else {
    showSlide(0);
  }
}

function runCode() {
  var editor = el("editor");
  if (editor) {
    var src = editor.value;
    try {
      eval(src);
    } catch (e) {
      alert(e);
    }
  }
  slideManager.text.style.display = "";
}

function handleEditKeys(event) {
  if (event.keyCode == 39 || event.keyCode == 32 ||
      event.keyCode == 37 || event.keyCode == 8) {
    event.cancelBubble = true;
  }
  return true;
}

function setupTextSlideAndMap() {
  setupTextSlide();
  if (!map) {
    map = new GMap2(document.getElementById("map"));
    showWorld();
  }
  map.clearOverlays();
}

function setupTextSlide() {
  showContent();
  hideCentral();
  showSlideControls();
  slideManager.text.style.display = "none";
}

function clearMap() {
  if (map) {
    map.clearOverlays();
  }
  if (typeof listener != 'undefined' && listener) {
    GEvent.removeListener(listener);
    listener = null;
  }
  if (typeof mgr != 'undefined') {
    try {
      mgr.clearMarkers();
    } catch (e) {
      alert(e);
    }
  }
}

function showSlideControls() {
  var controls = el("slidecontrols");
  if (controls) {
    setVisible(controls, true);
  }
}

function maybeShowWarning() {
  var warning = el("ffwarning");
  if (warning) {
    setVisible(warning, navigator.userAgent.indexOf("Firefox") == -1);
  }
}

function hideWarning() {
  var warning = el("ffwarning");
  if (warning) {
    setVisible(warning, false);
  }
}


function hideSlideControls() {
  var controls = el("slidecontrols");
  if (controls) {
    setVisible(controls, false);
  }
}

function showScreenshot(url, width, height) {
  var panel = el("screenshot");
  if (!panel) {
    return;
  }
  var bodyWidth = document.body.clientWidth;
  var bodyHeight = document.body.clientHeight;
  panel.innerHTML = "<img src='" + url + "' width='" + width +
      "' height='" + height + "' alt='screenshot' />";
  var x = parseInt((bodyWidth - width)/2);
  var y = parseInt((bodyHeight/2 - height)/2);
  setLocation(panel, x, y);
  setSize(panel, width, height);
  setZIndex(panel, 100);
  setVisible(panel, true);
  var shadow = el("shadow");
  if (shadow) {
    setLocation(shadow, x + 12, y + 12);
    setSize(shadow, width, height);
    setZIndex(shadow, 99);
    setVisible(shadow, true);
  }
}

function hideScreenshot() {
  var shadow = el("shadow");
  if (shadow) {
    setVisible(shadow, false);
    setLocation(shadow, 0, 0);
    setSize(shadow, 0, 0);
    setZIndex(shadow, 0);
  }
  var panel = el("screenshot");
  if (!panel) {
    return;
  }
  panel.innerHTML = "&nbsp;";
  setVisible(panel, false);
  setZIndex(panel, 0);
}

function setupTitlePage() {
  hideContent();
  showCentral();
  showWorld();
  showSlideControls();
  maybeShowWarning();
}

function showActiveCode() {
  if (slideManager.code.live) {
    setVisible(slideManager.code.live, true);
    setZIndex(slideManager.code.live, 50);
  }
}

function hideActiveCode() {
  if (slideManager.code.live) {
    setVisible(slideManager.code.live, false);
    setZIndex(slideManager.code.live, 0);
  }
}

function showSampleCode() {
  if (slideManager.code.sample) {
    setVisible(slideManager.code.sample, true);
    setZIndex(slideManager.code.sample, 50);
  }
}

function hideSampleCode() {
  if (slideManager.code.sample) {
    setVisible(slideManager.code.sample, false);
    setZIndex(slideManager.code.sample, 0);
  }
}

function showWorld() {
  if (map) {
    var zoom = map.getBoundsZoomLevel(new GLatLngBounds(
        new GLatLng(-90, -170), new GLatLng(90, 170)));
    map.setCenter(new GLatLng(30, 0), Math.max(2, zoom));
  }
}

function showCurtain() {
  var curtain = el("curtain");
  if (curtain) {
    setVisible(curtain, true);
  }
}

function hideCurtain() {
  var curtain = el("curtain");
  if (curtain) {
    setVisible(curtain, false);
  }
}

GEvent.addDomListener(document, 'keydown', handleSlideKeys);
