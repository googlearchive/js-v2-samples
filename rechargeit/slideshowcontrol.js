function SlideshowControl(opts) {
  this.STATES_ = {
    'PLAYING': 1, 
    'PAUSED': 2};
  this.currentState_ = this.STATES_.PAUSED;
  this.currentOverlay_ = 0;
  this.overlays_ = [];
}

SlideshowControl.prototype = new GControl();

SlideshowControl.prototype.initialize = function(map) {
  var me = this;
  GEvent.bind(map, "addoverlay" , me, this.handleOverlayAdd_);    
  GEvent.bind(map, "removeoverlay" , me, this.handleOverlayRemove_);    
  GEvent.bind(map, "infowindowclose", me, this.handleInfoWindowClose_);

  var container = document.createElement('div');
  
  var textDiv = document.createElement('div');
  textDiv.appendChild(document.createTextNode('Slideshow'));
  this.setButtonStyle_(textDiv);
 
  var playImg = document.createElement('img');
  playImg.src = 'http://pamela.fox.googlepages.com/icon_play.png';
  playImg.style.paddingLeft = '4px';
  playImg.style.cursor = 'pointer';
  playImg.style.verticalAlign = 'middle';
  this.playImg = playImg;
  GEvent.bindDom(playImg, 'click', me, this.handlePlayClick_);
  textDiv.appendChild(playImg);
  
  container.appendChild(textDiv);
  map.getContainer().appendChild(container);
  return container;
}

SlideshowControl.prototype.getDefaultPosition = function() {
  return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(30, 7));
}

SlideshowControl.prototype.setButtonStyle_ = function(button, image) {
  button.style.cursor = 'pointer';
  button.style.color = "#000000";
  button.style.backgroundColor = "white";
  button.style.font = "small Arial";
  button.style.border = "1px solid black";
  button.style.padding = "1px";
  button.style.margin= "0px";
  button.style.textAlign = "center";
  button.style.fontSize = "11px"; 
}

SlideshowControl.prototype.handleOverlayAdd_ = function(overlay) {
  if (!overlay.slideshowControlId_) {
    this.overlays_.push(overlay);
    overlay.slideshowControlId_ = (this.overlays_.length - 1);
  } else {
    this.overlays_[overlay.slideshowControlId_] = overlay;
  }
}

SlideshowControl.prototype.handleOverlayRemove_ = function(overlay) {
  if (!overlay.slideshowControlId_) return;
  this.overlays_[overlay.slideshowControlId_] = null;
}

SlideshowControl.prototype.handlePlayClick_ = function() {
  if (this.currentState_ == this.STATES_.PAUSED) {
    this.startSlideshow();    
  } else {
    this.pauseSlideshow();
  }
}

SlideshowControl.prototype.handleInfoWindowClose_ = function() {
  if (this.currentState_ == this.STATES_.PAUSED) return;
  this.triggerNextOverlay_();
}

SlideshowControl.prototype.startSlideshow = function() {
  this.currentState_ = this.STATES_.PLAYING;
  this.playImg.src = 'http://pamela.fox.googlepages.com/icon_pause.png';
  /*
  window.clearInterval(this.timer_);  
  var me = this;
  this.timer_ = window.setInterval(function() {
    me.triggerNextOverlay_();
  }, 6000);
  */
  this.triggerNextOverlay_();
} 

SlideshowControl.prototype.pauseSlideshow = function() {
  this.playImg.src = 'http://pamela.fox.googlepages.com/icon_play.png';
  this.currentState_ = this.STATES_.PAUSED;
  //window.clearInterval(this.timer_);
}

SlideshowControl.prototype.triggerNextOverlay_ = function() {
   var me = this;
  if (me.currentOverlay_ < me.overlays_.length) {
    // Make sure we don't try to trigger an overlay that was removed
    while (!me.overlays_[me.currentOverlay_] && 
        me.currentOverlay_ != me.overlays_.length) {
      me.currentOverlay_++;
    }
    GEvent.trigger(me.overlays_[me.currentOverlay_], 'click');
    me.currentOverlay_++;
  } else {
    me.currentOverlay_ = 0;
  }
}

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", "onYouTubePlayerStateChange");
}

function onYouTubePlayerStateChange(newState) {
  if (newState == 0) {
    map.closeInfoWindow();
  }
}
