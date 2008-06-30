/*
*
* Copyright 2008 Google
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*       http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

/**
 * @fileoverview The Slides object that manages the slide show, as
 * well as the function initslides() that sets up the Slides instance,
 * and a few more helper functions used by Slides.
 *
 * @author Steffen Meschkat (mesch@google.com)
 */

function initslides() {
  var nav = $('navigator');
  var slides = $('slides');
  var s = new Slides(nav, slides);

  var slidekeys = makeSlideKeyHandler(s);
  var mapkeys = makeMapKeyHandler();

  if (window.addEventListener) {
    // In Safari, keypress doesn't fire for cursor keys. So use keydown.
    window.document.addEventListener('keypress', slidekeys, false);
    window.document.addEventListener('keydown', mapkeys, false);
    window.document.addEventListener('keyup', mapkeys, false);
  } else {
    // In IE, need to use onkeydown for slidekeys, because keypress
    // doesn't fire for cursor keys.
    window.document.onkeydown = function() {
      slidekeys();
      mapkeys();
    };
    window.document.onkeyup = mapkeys;
  }
}


function makeSlideKeyHandler(slides) {
  return function(event) {
    event = event || window.event;
    var key = event.keyCode;
    if (key == 39) {
      slides.nextStep();
    } else if (key == 37) {
      slides.backStep();
    } else if (key == 38) {
      slides.backStep();
    } else if (key == 32) {
      slides.nextSlide();
    } else if (key == 40) {
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


function Slides(nav, slides) {
  /**
   * An array of information about all slides. The elements of this
   * array are tuples of a DOM node that is the entry in the navigator
   * for the slide, and a DOM node that is the slide itself.
   * @type Array.<Array>
   */
  this.slides_ = [];

  /**
   * The index of the currently active slide, or -1 as during
   * initialization while there is no active slide yet.
   * @type Number
   */
  this.slide_ = -1;

  /**
   * A map from symbolc slide names to slide numbers.
   * @type {Object}
   */
  this.slidesByName_ = {};

  for (var c = slides.firstChild; c; c = c.nextSibling) {
    if (!domTestClass(c, 'slide')) {
      continue;
    }
    var slide = c;
    var handle = create('div');
    var group = slide.getAttribute("group");
    if (group) {
      handle.className = group;
    }
    nav.appendChild(handle);
    this.slides_.push([handle, slide]);

    var h1 = slide.getElementsByTagName('H1')[0];
    if (h1) {
      handle.title = h1.innerHTML;
    }

    var name = slide.getAttribute('name');
    if (name) {
      this.slidesByName_[name] = this.slides_.length - 1;
    }
  }

  nav.onclick = bind(this, this.navclick_);

  /**
   * The State manager object that handles browser history and
   * bookmarks.
   */
  this.state_ = new State;
  this.state_.dominate('slide', 'step');
  this.state_.init(bind(this, this.updateState_));
}


Slides.prototype.updateState_ = function(param) {
  var slideNumberFromName = this.slidesByName_[param['slide']];
  if (typeof slideNumberFromName == 'number') {
    param['slide'] = slideNumberFromName;
  }
  this.setActiveImpl_(param['slide'] || 0, param['step']);
};


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
  this.setActiveImpl_(a, opt_step);
  this.state_.recordState('slide', this.slide_, true);
};


Slides.prototype.setActiveImpl_ = function(a, opt_step) {
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
      try {
        eval(attributeValue);
      } catch (e) {
        if (typeof console != 'undefined') {
          console.log(e);
        }
      }
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
  this.state_.recordState('step', this.step_, false);
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
