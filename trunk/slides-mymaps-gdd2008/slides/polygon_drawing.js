/*
* Copyright 2008 Google
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*       http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/
map.setCenter(new GLatLng(40.01, 116.4), 12);
polygon = new GPolygon([], "#ff0000", 2, 0.7, 
		       "#ff0000", 0.2);
map.addOverlay(polygon);
polygon.enableDrawing();