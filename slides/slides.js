function initslides() {
  var nav = $('navigator');
  var slides = $('slides');
  var s = new Slides(nav, slides);

  var slidekeys = makeSlideKeyHandler(s);
  var mapkeys = makeMapKeyHandler();

  if (window.addEventListener) {
    window.document.addEventListener('keypress', slidekeys, false);
    window.document.addEventListener('keydown', mapkeys, false);
    window.document.addEventListener('keyup', mapkeys, false);
  } else {
    // In IE, need to use onkeydown for slidekeys, because keypress
    // doesn't fire for cursor keys.
    window.document.onkeydown = function() {
      slidekeys();
      mapkeys();
    }
    window.document.onkeyup = mapkeys;
  }
}


function makeSlideKeyHandler(slides) {
  return function(event) {
    event = event || window.event;
    if (event.keyCode == 39) {
      slides.nextStep();
    } else if (event.keyCode == 37) {
      slides.backStep();
    } else if (event.keyCode == 38) {
      slides.backStep();
    } else if (event.keyCode == 32) {
      slides.nextSlide();
    } else if (event.keyCode == 40) {
      slides.nextStep();
    }
  };
}


function makeMapKeyHandler() {
  var elements = [
      'slides',
      'shade',
      'logo',
      'logo2'
  ];
  return function(event) {
    event = event || window.event;
    var key = event.which || event.keyCode;
    if (key == 49) {
      if (event.type == 'keydown') {
        d0.apply(null, elements);
      } else if (event.type == 'keyup') {
        d1.apply(null, elements);
      }
    }
  };

}


function $(id) {
  return document.getElementById(id);
}


function create(el) {
  return document.createElement(el);
}


function Slides(nav, slides) {
  this.slides_ = [];

  this.slide_ = -1;

  for (var c = slides.firstChild; c; c = c.nextSibling) {
    if (!domTestClass(c, 'slide')) {
      continue;
    }
    var slide = c;
    var handle = create('div');
    nav.appendChild(handle);
    this.slides_.push([ handle, slide ]);

    var h1 = slide.getElementsByTagName('H1')[0];
    if (h1) {
      handle.title = h1.innerHTML;
    }
  }

  //GEvent.bindDom(nav, 'click', this, this.navclick_);
  nav.onclick = bind(this, this.navclick_);

  var stateDominations = {
    'slide': [ 'step' ]
  };

  var me = this;
  applyInitialState(function(param) {
    me.setActive(param['slide'] || 0, param['step']);
  }, stateDominations);
}

function bind(object, method) {
  return function() {
    return method.apply(object, arguments);
  }
}

Slides.prototype.navclick_ = function(event) {
  var e = event || window.event;
  var src = e.target || e.srcElement;
  this.setActive(src);
};


Slides.prototype.nextSlide = function() {
  if (this.slide_ < this.slides_.length - 1) {
    this.setActive(this.slide_ + 1);
  }
};


Slides.prototype.backSlide = function() {
  if (this.slide_ > 0) {
    this.setActive(this.slide_ - 1);
  }
};


Slides.prototype.nextStep = function() {
  if (this.step_ < this.steps_ - 1) {
    this.step_ += 1;
    this.processStep_();
  } else {
    this.nextSlide();
  }
};


Slides.prototype.backStep = function() {
  if (this.step_ > 0) {
    this.step_ -= 1;
    this.processStep_();
  } else {
    this.backSlide();
  }
};


Slides.prototype.setActive = function(a, opt_step) {
  this.processAttribute_(this.getSlide_(this.slide_), 'onhide');
  this.processFloater_(this.slide_, false);

  var previousActive = this.slide_;

  for (var i = 0; i < this.slides_.length; ++i) {
    var handle = this.slides_[i][0];
    var slide = this.slides_[i][1];
    if (slide == a || handle == a || i == a) {
      this.slide_ = i;
      slide.style.display = 'block';
      slideLoadIFrame(slide);
      domAddClass(handle, 'active');

    } else {
      slide.style.display = 'none';
      domRemoveClass(handle, 'active');
    }
  }
  recordState('slide', this.slide_, true);
  this.processAttribute_(this.getSlide_(this.slide_), 'onshow');
  this.processFloater_(this.slide_, true);
  this.processSteps_(this.slide_, previousActive, opt_step);
};


Slides.prototype.getSlide_ = function(slideNumber) {
  if (slideNumber >= 0 && slideNumber < this.slides_.length) {
    return this.slides_[slideNumber][1];
  } else {
    return null;
  }
};


Slides.prototype.processAttribute_ = function(slide, attributeName) {
  if (slide) {
    var attributeValue = slide.getAttribute(attributeName);
    if (attributeValue) {
      //try {
        eval(attributeValue);
        //} catch (e) {}
    }
  }
};


Slides.prototype.processFloater_ = function(slideNumber, show) {
  var slide = this.getSlide_(slideNumber);
  if (!slide) {
    return;
  }
  var floater = slide.getAttribute('floater');
  if (!floater) {
    return;
  }
  showslides(!show);
  showfloat(floater, show);

  this.processAttribute_($(floater), show ? 'onshow' : 'onhide');
};


Slides.prototype.processSteps_ = function(active, previous, opt_step) {
  if (active == previous) {
    return;
  }
  var slide = this.getSlide_(active);
  if (!slide) {
    return;
  }
  var steps = slide.getAttribute('steps');
  if (!steps) {
    this.steps_ = 0;
    this.step_ = 0;
    return;
  }

  this.steps_ = Number(steps);
  if (opt_step != null) {
    this.step_ = Number(opt_step);
  } else if (active > previous) {
    this.step_ = 0;
  } else {
    this.step_ = this.steps_ - 1;
  }
  this.processStep_();
};


Slides.prototype.processStep_ = function() {
  recordState('step', this.step_, false);
  var slide = this.getSlide_(this.slide_);
  if (!slide) {
    return;
  }
  var step = this.step_;

  domTraverseElements(slide, function(node) {
    var stepAtt = node.getAttribute('step');
    if (!stepAtt) {
      return;
    }
    var stepVal = Number(stepAtt);
    if (stepVal <= step) {
      node.style.visibility = '';
    } else {
      node.style.visibility = 'hidden';
    }
  });
};


function domTraverseElements(node, method) {
  method(node);
  for (var c = node.firstChild; c; c = c.nextSibling) {
    if (c.nodeType == 1) {
      arguments.callee(c, method);
    }
  }
}


function showslides(show) {
  var elements = [
      'slides',
      'shade',
      'logo',
      'logo2',
      'header'
  ];

  (show ? d1 : d0).apply(null, elements);
}


function showfloat(id, show) {
  if (show) {
    $(id).style.display = 'block';
  } else {
    $(id).style.display = '';
  }
}


function d0(var_args) {
  foreach(arguments, function(id) {
    $(id).style.display = 'none';
  });
}


function d1(var_args) {
  foreach(arguments, function(id) {
    $(id).style.display = '';
  });
}


function v0(var_args) {
  foreach(arguments, function(id) {
    $(id).style.visibility = 'hidden';
  });
}


function v1(var_args) {
  foreach(arguments, function(id) {
    $(id).style.visibility = '';
  });
}


function foreach(array, fn) {
  for (var i = 0; i < array.length; ++i) {
    try {
      fn(array[i]);
    } catch (e) {}
  }
}


function slideLoadIFrame(slide) {
  var iframes = slide.getElementsByTagName('iframe');
  for (var ii = 0; ii < iframes.length; ++ii) {
    var iif = iframes[ii];
    slideCheckIframe(iif);
  }
}


function slideCheckIframe(element) {
  var s = element.getAttribute('xsrc');
  var w = element.contentWindow;
  try {
    // Will throw exception once external page is loaded here.
    if (w.location == 'about:blank') {
      w.location.replace(s);
      window.setTimeout(function() {
        $('navigator').focus();
      });
    }
  } catch (e) {}
}


function domTestClass(element, cls) {
  var classes = (element.className || '').split(/\s+/);
  for (var i = 0; i < classes.length; ++i) {
    if (classes[i] == cls) {
      return true;
    }
  }
  return false;
}


function domAddClass(element, cls) {
  var classes = (element.className || '').split(/\s+/);
  for (var i = 0; i < classes.length; ++i) {
    if (classes[i] == cls) {
      return;
    }
  }
  classes.push(cls);
  element.className = classes.join(' ');
}


function domRemoveClass(element, cls) {
  var classes = (element.className || '').split(/\s+/);
  for (var i = 0; i < classes.length; ++i) {
    if (classes[i] == cls) {
      classes.splice(i--, 1);
    }
  }
  element.className = classes.join(' ');
}
function xmlEscapeText(text) {
  return text.
    replace(/&/g, '&amp;').
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}
