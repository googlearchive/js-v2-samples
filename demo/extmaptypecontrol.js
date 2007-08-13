/*
* ExtMapTypeControl Class 
*  Copyright (c) 2007, Google 
*  Author: Pamela Fox, others
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
* This class lets you add a control to the map which mimics GMapTypeControl
*  and allows for the addition of a traffic button/traffic key.
*/

/*
 * Constructor for ExtMapTypeControl, which uses an option hash
 * to decide what elements to put in the control.
 * @param {opt_opts} Named optional arguments:
 *   opt_opts.showTraffic {Boolean} Controls whether traffic button is shown
 *   opt_opts.showTrafficKey {Boolean} Controls whether traffic key is shown
 */
function ExtMapTypeControl(opt_opts) {
  this.options = opt_opts || {};
}


ExtMapTypeControl.prototype = new GControl();

/**
 * Is called by GMap2's addOverlay method. Creates the button 
 *  and appends to the map div.
 * @param {GMap2} map The map that has had this ExtMapTypeControl added to it.
 * @return {DOM Object} Div that holds the control
 */ 
ExtMapTypeControl.prototype.initialize = function(map) {
  var container = document.createElement("div");
  var me = this;

  var satDiv = me.createButton_("Satellite");
  var mapDiv = me.createButton_("Map");
  var hybDiv = me.createButton_("Hybrid");
 
  me.assignButtonEvent_(satDiv, map, G_SATELLITE_MAP, [mapDiv, hybDiv]);
  me.assignButtonEvent_(hybDiv, map, G_HYBRID_MAP, [satDiv, mapDiv]);
  me.assignButtonEvent_(mapDiv, map, G_NORMAL_MAP, [satDiv, hybDiv]);
  GEvent.addListener(map, "maptypechanged", function() {
    if (map.getCurrentMapType() == G_NORMAL_MAP) {
      GEvent.trigger(mapDiv, "click"); 
    } else if (map.getCurrentMapType() == G_SATELLITE_MAP) {
      GEvent.trigger(satDiv, "click");
    } else if (map.getCurrentMapType() == G_HYBRID_MAP) {
      GEvent.trigger(hybDiv, "click");
    }
  });

 if (me.options.showTraffic) {
   var trafficDiv = me.createButton_("Traffic");
   trafficDiv.style.marginRight = "8px";
   trafficDiv.style.visibility = 'hidden';
   trafficDiv.firstChild.style.cssFloat = "left";
   trafficDiv.firstChild.style.styleFloat = "left";
   // Sending true makes overlay hidden by default
   me.trafficInfo = new GTrafficOverlay(true);
   me.trafficInfo.hidden = true;
   // We have to do this so that we can sense if traffic is in view
   GEvent.addListener(me.trafficInfo, "changed", function(hasTrafficInView) {
     if (hasTrafficInView) {
       trafficDiv.style.visibility = 'visible';
     } else {
       trafficDiv.style.visibility = 'hidden';
     }
   });
   map.addOverlay(me.trafficInfo);
   
   GEvent.addDomListener(trafficDiv, "click", function() {
     if (me.trafficInfo.hidden) {
       me.trafficInfo.hidden = false;
       me.trafficInfo.show();
     } else {
       me.trafficInfo.hidden = true;
       me.trafficInfo.hide();
     }
      me.toggleButton_(trafficDiv, !me.trafficInfo.hidden);
    });

    me.toggleButton_(trafficDiv, false);
    container.appendChild(trafficDiv);
  }

  container.appendChild(satDiv);
  container.appendChild(mapDiv);
  container.appendChild(hybDiv);

  map.getContainer().appendChild(container);
  
  return container;
}

/*
 * Creates simple buttons with text nodes. 
 * @param {String} text Text to display in button
 * @return {DOM Object} The div for the button.
 */
ExtMapTypeControl.prototype.createButton_ = function(text) {
  var buttonDiv = document.createElement("div");
  buttonDiv.mapType = text;
  this.setButtonStyle_(buttonDiv, text);
  buttonDiv.style.cssFloat = "left";
  buttonDiv.style.styleFloat = "left";
  var textDiv = document.createElement("div");
  textDiv.appendChild(document.createTextNode(""));
  textDiv.style.width = "6em";
  buttonDiv.appendChild(textDiv);
  return buttonDiv;
}

/*
 * Assigns events to MapType buttons to change maptype
 *  and toggle button styles correctly for all buttons
 *  when button is clicked.
 *  @param {DOM Object} div Button's div to assign click to
 *  @param {GMap2} Map object to change maptype of.
 *  @param {Object} mapType GMapType to change map to when clicked
 *  @param {Array} otherDivs Array of other button divs to toggle off
 */  
ExtMapTypeControl.prototype.assignButtonEvent_ = function(div, map, mapType, otherDivs) {
  var me = this;

  GEvent.addDomListener(div, "click", function() {
    for (var i = 0; i < otherDivs.length; i++) {
      me.toggleButton_(otherDivs[i], false);
    }
    me.toggleButton_(div, true);
    map.setMapType(mapType);
  });
}

/*
 * Changes style of button to appear on/off depending on boolean passed in.
 * @param {DOM Object} div  Button div to change style of
 * @param {Boolean} boolCheck Used to decide to use on style or off style
 */
ExtMapTypeControl.prototype.toggleButton_ = function(div, boolCheck) {
  var add = boolCheck ? "_down" : "";
  div.style.background = "url('bluebutton_" + div.mapType + add + ".png')";
}

/*
 * Required by GMaps API for controls. 
 * @return {GControlPosition} Default location for control
 */
ExtMapTypeControl.prototype.getDefaultPosition = function() {
  return new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(7, 7));
}

/*
 * Sets the proper CSS for the given button element.
 * @param {DOM Object} button Button div to set style for
 */
ExtMapTypeControl.prototype.setButtonStyle_ = function(button, label) {
  button.style.color = "#000000";
  button.style.backgroundColor = "white";
  button.style.background = "url('bluebutton_" + label + ".png')";
  button.style.width = "85px";
  button.style.height = "30px";
  button.style.font = "small Arial";
  button.style.border = "1px solid black";
  button.style.padding = "0px";
  button.style.margin= "0px";
  button.style.textAlign = "center";
  button.style.fontSize = "12px"; 
  button.style.cursor = "pointer";
}

