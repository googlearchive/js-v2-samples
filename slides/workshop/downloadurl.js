map.setCenter(new GLatLng(37.40, -122.14), 11);
GDownloadUrl("data.xml", function(data, status) {
  var markers = GXml.parse(data).documentElement.
      getElementsByTagName("marker");
  for (var i in markers) {
    var m = markers[i];
    var point = new GLatLng(
        parseFloat(m.getAttribute("lat")),
        parseFloat(m.getAttribute("lng")));
    map.addOverlay(new GMarker(point));
  }
});
