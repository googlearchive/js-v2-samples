var listener = GEvent.addListener(
    map, "moveend", function() {
      alert(map.getCenter().toString());
      GEvent.removeListener(listener);
});
