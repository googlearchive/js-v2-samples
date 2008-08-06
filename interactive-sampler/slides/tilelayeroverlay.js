var stanford = new GTileLayer(
    new GCopyrightCollection(""), 0, 17);
stanford.getTileUrl = function(tile, zoom) {
  return "http://www.stanford.edu/dept/ucomm/" +
         "map/tiles/tile_" + tile.x +
         "_" + tile.y + "_" + zoom + ".png";
};
stanford.isPng = function() { return true; };
var overlay = new GTileLayerOverlay(stanford);
map.setCenter(new GLatLng(37.43, -122.16), 15);
map.addOverlay(overlay);
overlay.show();
