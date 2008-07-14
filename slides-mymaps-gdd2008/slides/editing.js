/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/

GEvent.bind(polygon, "mouseover", polygon, 
	    polygon.enableEditing);
GEvent.bind(polygon, "mouseout", polygon, 
	    polygon.disableEditing);
