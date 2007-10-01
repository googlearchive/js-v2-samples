var marker = new GMarker(map.getCenter());
map.clearOverlays();
map.addOverlay(marker);
GEvent.addListener(marker, "mouseover", function() {
  marker.setImage("images/yellow.png");
});
GEvent.addListener(marker, "mouseout", function() {
  marker.setImage("images/marker.png");
});
