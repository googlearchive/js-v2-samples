map.setCenter(new GLatLng(0, 0), 2);
var marker = new GMarker(map.getCenter());
map.addOverlay(marker);
GEvent.addListener(marker, "mouseover",
    function() {
      marker.setPoint(new GLatLng(
          120 * Math.random() - 60,
          360 * Math.random() - 180));
});
