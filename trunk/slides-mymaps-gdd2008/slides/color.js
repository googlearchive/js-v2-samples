/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/
GEvent.addListener(polygon, "click", function () {
  polygon.setStrokeStyle({
      "color": getRandomColor(), 
      "opacity": Math.random(),
      "weight": Math.round(Math.random() * 10)
    });
  polygon.setFillStyle({
      "color": getRandomColor(), 
      "opacity": Math.random()
  });
});

function getRandomColor() {
  var dec = Math.round(Math.random() * 0xffffff);
  return "#" + (dec + 0x1000000).toString(16).
    substring(1);
}
