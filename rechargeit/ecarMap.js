// Had to make this global to integrate with Youtube Player API. *sigh*
var map;

/**
 * Set up the map.
 */
function setupMap() {
  map = new GMap2(document.getElementById("map"));
  map.addControl(new GSmallMapControl());

  // Centers the map around nebraska, zoomed out to fit the entire USA.
  // In the future we can add ip geocoding to center it a the user's location.
  map.setCenter(new GLatLng(41, -100), 4);
  return map;
};

/**
 * Creates an icon.
 */
function createIcon() {
  var icon = new GIcon();
  icon.image = "http://www.google.org/images/carmap/leaf.png";
  icon.iconSize = new GSize(28, 11);
  icon.iconAnchor = new GPoint(15, 15);
  icon.infoWindowAnchor = new GPoint(10, 10);
  return icon;
};


function makeInfoTabContent(markerXmlNode) {
  var infoHtml = [];

  var image = markerXmlNode.getAttribute("image");
  if (image) {
    infoHtml.push("<img align=\"right\" src=\"");
    infoHtml.push(image);
    infoHtml.push("\"></img>");
  }

  var site = markerXmlNode.getAttribute("owner_website");
  if (site != null && site != "") {
    infoHtml.push("<a target=\"_blank\" href=\"");
    infoHtml.push(site);
    infoHtml.push("\">");
  }
  infoHtml.push(markerXmlNode.getAttribute("owner"));
  if (site != null && site != "") {
    infoHtml.push("</a>");
  }
  infoHtml.push("<br>");
  infoHtml.push(markerXmlNode.getAttribute("location"));
  infoHtml.push("<br><i>");
  infoHtml.push(markerXmlNode.getAttribute("date"));
  infoHtml.push("</i>");
  return infoHtml.join('');
};

function makeConverterTabContent(markerXmlNode) {
  var infoHtml = [];
  var image = markerXmlNode.getAttribute("image");
  if (image) {
    infoHtml.push("<img align=\"right\" src=\"");
    infoHtml.push(image);
    infoHtml.push("\"></img>");
  }

  var converter = markerXmlNode.getAttribute("converter");
  var site = markerXmlNode.getAttribute("converter_website");
  if (converter != null && converter != "" &&
      converter != "Did it themselves!") {
    infoHtml.push("By: ");
  }
  if (site != null && site != "") {
    infoHtml.push("<a target=\"_blank\" href=\"");
    infoHtml.push(site);
    infoHtml.push("\">");
  }
  infoHtml.push(markerXmlNode.getAttribute("converter"));
  if (site != null && site != "") {
    infoHtml.push("</a>");
  }
  infoHtml.push("<br>");
  infoHtml.push(markerXmlNode.getAttribute("desc"));
  return infoHtml.join('');
};

/**
 * Create an tab to display a larger car image.
 * (Currently not used because map is too small)
 */
function makeImageTabContent(markerXmlNode) {
  var largeImage = markerXmlNode.getAttribute("image_large");
  if (largeImage == null)
    return null;

  var imageHtml = [];
  imageHtml.push("<img src=\"");
  imageHtml.push(largeImage);
  imageHtml.push("\"></img>");
  return imageHtml.join('');
};

function openInfoWindow(marker, infoContent, converterContent, imageContent) {
  var infoOptions = { maxWidth: 80 , maxHeight: 60 };
  var tabs = [];
  tabs.push(new GInfoWindowTab("Owner", infoContent));
  tabs.push(new GInfoWindowTab("Car Info", converterContent));
  if (imageContent != null) {
    tabs.push(new GInfoWindowTab("Image", imageContent));
  }
  marker.openInfoWindowTabsHtml(tabs, infoOptions);
};

function createMarker(markerXmlNode, icon) {
  var point = new GLatLng(parseFloat(markerXmlNode.getAttribute("lat")),
                          parseFloat(markerXmlNode.getAttribute("lng")));
  var marker = new GMarker(point, icon);

  var infoContent = makeInfoTabContent(markerXmlNode);
  var converterContent = makeConverterTabContent(markerXmlNode);
  GEvent.addListener(marker, "click", function() {
    openInfoWindow(marker, infoContent, converterContent, null);
  });
  return marker;
};

function createMarkers(mgr, data, icon) {
  var zoom0 = [];
  var zoom1 = [];
  var zoom2 = [];
  var zoomDefault = []; // 3 is the default.
  var zoom4 = [];
  var zoom5 = [];
  var zoom6 = [];
  var zoom7 = [];


  var xml = GXml.parse(data);
  var markers = xml.documentElement.getElementsByTagName("marker");

  for (var i = 0; i < markers.length; i++) {
    var markerXmlNode = markers[i];
    var marker = createMarker(markerXmlNode, icon);
    var minZoom = markerXmlNode.getAttribute("minzoom");
    if (minZoom == "0") {
      zoom0.push(marker);
    } else if (minZoom == "1") {
      zoom1.push(marker);
    } else if (minZoom == "2") {
      zoom2.push(marker);
    } else if (minZoom == "4") {
      zoom4.push(marker);
    } else if (minZoom == "5") {
      zoom5.push(marker);
    } else if (minZoom == "6") {
      zoom6.push(marker);
    } else if (minZoom == "7") {
      zoom7.push(marker);
    } else {
      // default is 3
      zoomDefault.push(marker);
    }
  }
  // Add markers to manager
  mgr.addMarkers(zoom0, 0);
  mgr.addMarkers(zoom1, 1);
  mgr.addMarkers(zoom2, 2);
  mgr.addMarkers(zoomDefault, 3);
  mgr.addMarkers(zoom4, 4);
  mgr.addMarkers(zoom5, 5);
  mgr.addMarkers(zoom6, 6);
  mgr.addMarkers(zoom7, 7);
  mgr.refresh();
};

function loadAndSetupMarkers(map, icon) {
  var mgr = new MarkerManager(map);
  GDownloadUrl("ecarMapData.xml", function(data, responseCode) {
    createMarkers(mgr, data, icon);
    map.addControl(new SlideshowControl(), new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(7, 7)));
  });
  return mgr;
};

function handleJSONLoad(json) {
  var bounds = new GLatLngBounds();       

  if(json.feed.entry[0]["gsx$" + param_rankColumn]) {
    usingRank = true;
    json.feed.entry.sort(cm_sortRows);
  }

  for (var i = 0; i < json.feed.entry.length; i++) {
    var entry = json.feed.entry[i];
    if(entry["gsx$" + param_latColumn]) {
      var lat = parseFloat(entry["gsx$" + param_latColumn].$t);
      var lng = parseFloat(entry["gsx$" + param_lngColumn].$t);
      var point = new GLatLng(lat,lng);
      var html = "<div style='font-size:12px'>";
      html += "<strong>" + entry["gsx$"+param_titleColumn].$t 
              + "</strong>";
      var label = entry["gsx$"+param_titleColumn].$t;
      var rank = 0;
      if(entry["gsx$" + param_descriptionColumn]) {
        html += "<br/>" + entry["gsx$"+param_descriptionColumn].$t;
      }
      html += "</div>";

      // create the marker
      var marker = cm_createMarker(point,label,html,rank);
      cm_map.addOverlay(marker);
      cm_mapMarkers.push(marker);
      cm_mapHTMLS.push(html);
      bounds.extend(point);
    }
  }

  cm_map.setZoom(cm_map.getBoundsZoomLevel(bounds));
  cm_map.setCenter(bounds.getCenter());
}

/**
 * Creates marker with ranked Icon or blank icon,
 * depending if rank is defined. Assigns onclick function.
 * @param {GLatLng} point Point to create marker at
 * @param {String} title Tooltip title to display for marker
 * @param {String} html HTML to display in InfoWindow
 * @param {Number} rank Number rank of marker, used in creating icon
 * @return {GMarker} Marker created
 */
function cm_createMarker(point, title, html, rank) {
  var markerOpts = {};
  var nIcon = new GIcon(cm_baseIcon);

  if(rank > 0 && rank < 100) {
    nIcon.imageOut = "http://googlemaps.github.io/js-v2-samples/" +
        "markers/" + param_iconType + "/marker" + rank + ".png";
    nIcon.imageOver = "http://googlemaps.github.io/js-v2-samples/" +
        "markers/" + param_iconOverType + "/marker" + rank + ".png";
    nIcon.image = nIcon.imageOut; 
  } else { 
    nIcon.imageOut = "http://googlemaps.github.io/js-v2-samples/" +
        "markers/" + param_iconType + "/blank.png";
    nIcon.imageOver = "http://googlemaps.github.io/js-v2-samples/" +
        "markers/" + param_iconOverType + "/blank.png";
    nIcon.image = nIcon.imageOut;
  }

  markerOpts.icon = nIcon;
  markerOpts.title = title;              
  var marker = new GMarker(point, markerOpts);
  
  GEvent.addListener(marker, "click", function() {
    marker.openInfoWindowHtml(html);
  });
  return marker;
}

function loadJSON() {
  // Retrieve the JSON feed.
  var script = document.createElement('script');

  script.setAttribute('src', 'http://spreadsheets.google.com/feeds/list'
                         + '/' + param_ssKey + '/' + param_wsId + '/public/values' +
                        '?alt=json-in-script&callback=handleJSONLoad');
  script.setAttribute('id', 'jsonScript');
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}

function load() {
  if (GBrowserIsCompatible()) {
    var map = setupMap();
    var icons = createIcon();
    loadAndSetupMarkers(map, icons);
    var spreadsheetsLayer = new SpreadsheetsLayer(map, {column_title: 'name', column_desc: 'urlofyoutubevideo', query: 'sq=approved%3Dyes'});
    spreadsheetsLayer.enable();
  }
};

