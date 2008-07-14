/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

GEvent.addDomListener(document, "keypress", function(e) {
  switch(e.keyCode) {
   case 27: map.removeOverlay(poly); // ESC
   case 13: poly.disableEditing(); // ENTER | ESC
  break;
  }
});
  
