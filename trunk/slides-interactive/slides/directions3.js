var statusDiv = document.getElementById('status');
var stepsDiv = document.getElementById('steps');
var firstDiv = document.getElementById('first');

var dir = new GDirections(null, null);
GEvent.addListener(dir, "load", function() {
  statusDiv.innerHTML = dir.getStatus().code;
  var route = dir.getRoute(0);
  stepsDiv.innerHTML = route.getNumSteps();
  firstDiv.innerHTML = route.getStep(0).
                       getDescriptionHtml();
});
dir.load("New York to Boston", {
         getSteps: true,
         getPolyline: false });
