window.pane = new MyPane;
map.addControl(pane);
var dir = new GDirections(map, pane.getPanel());
GEvent.addListener(dir, "error", function(x) {
  alert('Error: ' + dir.getStatus().code);
});
dir.load('San Francisco, CA to San Jose, CA');
