var base = "http://www.google.com/mapfiles/marker";
var ch = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ];
map.setCenter(new GLatLng(8, 0), 5);
for (var i = 0; i < ch.length; ++i) {
  var icon = new GIcon(G_DEFAULT_ICON);
  icon.image = base + ch[i] + ".png";
  map.addOverlay(new GMarker(new GLatLng(8, 2*i, 0),
                             { icon: icon }));
}
