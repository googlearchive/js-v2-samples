var tiny = new GIcon();
tiny.image = "images/tiny_red.png";
tiny.shadow = "images/tiny_red_shadow.png";
tiny.iconSize = new GSize(12, 20);
tiny.shadowSize = new GSize(22, 20);
tiny.iconAnchor = new GPoint(6, 20);
map.setCenter(new GLatLng(51.5, 0), 8);
for (var i = 0; i < 20; i++) {
  var point = new GLatLng(51+Math.random(),
                          -0.5+Math.random());
  map.addOverlay(new GMarker(point, { icon: tiny }));
}
