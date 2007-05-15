/* A Bar is a simple overlay that outlines a lat/lng bounds on the
 * map. It has a border of the given weight and color and can optionally
 * have a semi-transparent background color.
 * @param latlng {GLatLng} Point to place bar at.
 * @param opts {Object Literal} Passes configuration options - 
 *   weight, color, height, width, text, and offset.
 */
function Bar(latlng, opts) {
  this.latlng = latlng;

  this.weight_ = opts.weight || 0;
  this.color_ = opts.color || "#FFFFFF";
  this.height_ = opts.height || 30;
  this.width_ = opts.width || 20;
  this.text_ = opts.text || "";
  this.horizontalOffset_ = opts.horizontalOffset || 0;
  this.verticalOffset_ = opts.verticalOffset || 20;
}

/* Bar extends GOverlay class from the Google Maps API
 */
Bar.prototype = new GOverlay();

/* Creates the DIV representing this Bar.
 * @param map {GMap2} Map that bar overlay is added to.
 */
Bar.prototype.initialize = function(map) {

  // Create the DIV representing our Bar
  var div = document.createElement("div");
  div.style.border = " 1px solid #000000";
  div.style.position = "absolute";
  div.style.paddingLeft = "2px";
  div.style.backgroundColor = this.color_;
  div.appendChild(document.createTextNode(this.text_));

  map.getPane(G_MAP_MARKER_PANE).appendChild(div);

  this.map_ = map;
  this.div_ = div;
};

/* Remove the main DIV from the map pane
 */
Bar.prototype.remove = function() {
  this.div_.parentNode.removeChild(this.div_);
};

/* Copy our data to a new Bar
 * @return {Bar} Copy of bar
 */
Bar.prototype.copy = function() {
  var opts = {};
  opts.weight = this.weight_;
  opts.color = this.color_;
  opts.height = this.height_;
  opts.width = this.width_;
  opts.horizontalOffset = this.horizontalOffset_;
  opts.verticalOffset = this.verticalOffset_;
  opts.text = this.text_;

  return new Bar(this.latlng, opts);
};

/* Redraw the Bar based on the current projection and zoom level
 * @param force {boolean} Helps decide whether to redraw overlay
 */
Bar.prototype.redraw = function(force) {

  // We only need to redraw if the coordinate system has changed
  if (!force) return;

  // Calculate the DIV coordinates of two opposite corners 
  // of our bounds to get the size and position of our Bar
  var divPixel = this.map_.fromLatLngToDivPixel(this.latlng);

  // Now position our DIV based on the DIV coordinates of our bounds
  this.div_.style.width = this.width_ + "px";

  this.div_.style.left = (divPixel.x + this.horizontalOffset_) + "px";
  
  this.div_.style.height = (this.height_) + "px";
  this.div_.style.top = (divPixel.y - this.verticalOffset_) 
                          - this.height_ + "px";
};
