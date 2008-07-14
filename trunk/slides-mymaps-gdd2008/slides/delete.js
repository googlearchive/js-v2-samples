/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

GEvent.addListener(polygon, "click", 
                  function(latlng, index) {
  if (typeof index == "number") {
    polygon.deleteVertex(index);
  }
});

