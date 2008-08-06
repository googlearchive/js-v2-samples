var points = [
  new GLatLng(13.734508, 100.495892),
  new GLatLng(13.730922, 100.494776),
  new GLatLng(13.728463, 100.501814),
  new GLatLng(13.730089,100.508659)
];
map.setCenter(new GLatLng(13.732, 100.5), 16);
map.clearOverlays();
map.setMapType(G_NORMAL_MAP);
map.addOverlay(new GPolyline(points));
