var address = "Avenue Gustave Eiffel, Paris";
var geocoder = new GClientGeocoder;
geocoder.getLatLng(address, function(point) {
  if (point) {
    map.clearOverlays();
    map.addOverlay(new GMarker(point));
    map.setCenter(point, 17);
  }
});
