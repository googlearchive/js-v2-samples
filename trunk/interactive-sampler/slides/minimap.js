function showMiniMap() {
  window.setTimeout(function() {
    var minidiv = document.getElementById('minimap');
    var minimap = new GMap2(minidiv);
    minimap.setCenter(new GLatLng(37.5,-122), 7);
  }, 0);
}
showMiniMap();
