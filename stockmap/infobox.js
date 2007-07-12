/* An InfoBox is like an info window, but it displays
 * under the marker, opens quicker, and has flexible styling.
 * @param {GLatLng} latlng Point to place bar at
 * @param {Object} opts Passes configuration options - content, 
 *   offsetVertical, offsetHorizontal, className, height, width
 */
function InfoBox(latlng, opts) {
  this.latlng_ = latlng;
  this.content_ = opts.content || "Hello World";
  this.offsetVertical_ = opts.offsetVertical || -5;
  this.offsetHorizontal_ = opts.offsetHorizontal || -5;

  this.className_ = opts.className || "";  
  this.height_ = opts.height || 200;
  this.width_ = opts.width || 300;
}

/* InfoBox extends GOverlay class from the Google Maps API
 */
InfoBox.prototype = new GOverlay();

/* Creates the DIV representing this InfoBox
 * @param {GMap2} map The map to add infobox to
 */
InfoBox.prototype.initialize = function(map) {
  // Create the DIV representing our Bar
  var div = document.createElement("div");

  if (this.className_ != "") {
    div.className = this.className_;
  } else {
    div.style.border = "1px solid #000000";
    div.style.position = "absolute";
    div.style.backgroundColor = "#FFFFFF";
    div.style.padding = "2px";
    div.style.width = this.width_ + "px";
    div.style.height = this.height_ + "px";
  } 

  var contentDiv = document.createElement("div");
  contentDiv.innerHTML = this.content_;

  var topDiv = document.createElement("div");
  topDiv.style.textAlign = "right";
  var closeImg = document.createElement("img");
  closeImg.src = "http://www.google.com/intl/en_us/mapfiles/close.gif";
  topDiv.appendChild(closeImg);

  function removeInfoBox(ib, m) {
    return function() { 
      GEvent.trigger(ib, "closeclick");
      m.removeOverlay(ib);
    };
  }
  
  GEvent.addDomListener(closeImg, 'click', removeInfoBox(this, map));
 
  div.appendChild(topDiv);
  div.appendChild(contentDiv);
  div.style.display = 'none';

  map.getPane(G_MAP_MARKER_PANE).appendChild(div);

  this.map_ = map;
  this.div_ = div;
}

/* Remove the main DIV from the map pane
 */
InfoBox.prototype.remove = function() {
  this.div_.parentNode.removeChild(this.div_);
}

/* Copy our data to a new InfoBox
 * @return {InfoBox} Copy of infobox
 */
InfoBox.prototype.copy = function() {
  var opts = {};
  opts.latlng = this.latlng_;
  opts.content = this.content_;
  opts.offsetVertical = this.offsetVertical_;
  opts.offsetHorizontal = this.offsetHorizontal_;

  opts.className = this.className_ || "";  
  opts.height = this.height_;
  opts.width = this.width_;
  return new InfoBox(this.latlng, opts);
}

/* Redraw the Bar based on the current projection and zoom level
 * @param {boolean} force Helps decide whether to redraw overlay
 */
InfoBox.prototype.redraw = function(force) {
  // We only need to redraw if the coordinate system has changed
  if (!force) return;

  // Calculate the DIV coordinates of two opposite corners of our bounds to
  // get the size and position of our Bar
  var pixPosition = this.map_.fromLatLngToDivPixel(this.latlng_);

  // Now position our DIV based on the DIV coordinates of our bounds
  this.div_.style.width = this.width_ + "px";
  this.div_.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
  this.div_.style.height = this.height_ + "px";
  this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
  this.div_.style.display = 'block';

  // if we go beyond map, pan map
  var mapWidth = this.map_.getSize().width;
  var mapHeight = this.map_.getSize().height;
  var bounds = this.map_.getBounds();
  var boundsSpan = bounds.toSpan();
  var longSpan = boundsSpan.lng();
  var latSpan = boundsSpan.lat();
  var degWidth = (this.width_/mapWidth) * longSpan;
  var degHeight = (this.height_/mapHeight) * latSpan;

  if (this.latlng_.lng() + degWidth > bounds.getNorthEast().lng()) {
    this.map_.panTo(this.latlng_);
  }   

  var bottompt = new GLatLng( (this.latlng_.lat() - degHeight), this.latlng_.lng());
  if (!bounds.contains(bottompt)) {
    this.map_.panTo(this.latlng_);
  }
  
}
