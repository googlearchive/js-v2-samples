var mgr = new MarkerManager(map);
var count = 1024;
for (var z = 10; count > 0; z -= 2, count >>= 2) {
  var markers = [];
  for (var i = 0; i < count; ++i) {
    var lat = 38 + Math.random() * 20;
    var lng = -9 + Math.random() * 52;
    markers.push(new GMarker(new GLatLng(lat, lng)));
  }
  mgr.addMarkers(markers, z);
}
map.setCenter(new GLatLng(49, 17), 4);
mgr.refresh();
