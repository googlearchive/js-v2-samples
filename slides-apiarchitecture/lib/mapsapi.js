var map;

var listeners = [];

var loc = {
  'default': [0.0, 0.0],
  'paloalto': [37.4419, -122.1419 ],
  'liconf': [37.7843, -122.4085],
  'oak': [37.7156, -122.2106],
  'usydney': [-33.888711, 151.189492],
  'hamburg': [53.553108,9.972239],
  'vancouver': [49.288439, -123.120507],
  'beijing': [39.905523, 116.400146]
};

function initmap(locName) {
  if (typeof GMap2 == 'undefined') {
    return;
  }
  if (typeof G_PHYSICAL_MAP != 'undefined') {
    G_DEFAULT_MAP_TYPES.push(G_PHYSICAL_MAP);
  }
  map = new GMap2($('bgmap'));
  var c = loc[locName];
  map.setCenter(new GLatLng(c[0], c[1]), 13);
  window.onresize = function() {
    map.checkResize();
  };

  GEvent.addListener(map, 'clearoverlays', function() {
    foreach(listeners, GEvent.removeListener);
    listeners.length = 0;
  });
}

function exitmap() {
  if (typeof GUnload == 'undefined') {
    return;
  }
  GUnload()
}

var controls_ = {};
function controltypes_(which) {
  if (!arguments.callee.data) {
    arguments.callee.data = {
      map: [
          GSmallMapControl,
          new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(10, 20))
      ],
      zoom: [
          GSmallZoomControl,
          new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(10, 20))
      ],
      scale: [
          GScaleControl,
          new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(10, 40))
      ],
      overview: [ GOverviewMapControl, null ],
      type: [ GMapTypeControl, null ],
      panel: [ MyPane, null ]
    };
  }
  return arguments.callee.data[which];
}

function control(which) {
  var c = controls_[which];
  if (c) {
    map.removeControl(c);
    controls_[which] = null;
  } else {
    var controldata = controltypes_(which);
    if (controldata) {
      var c1 = new controldata[0];
      map.addControl(c1, controldata[1]);
      controls_[which] = c1;
    } else {
      alert('no control ' + which);
    }
  }

  if (which == 'map') {
    if (controls_['zoom']) {
      map.removeControl(controls_['zoom']);
      controls_['zoom'] = null;
    }
  } else if (which == 'zoom') {
    if (controls_['map']) {
      map.removeControl(controls_['map']);
      controls_['map'] = null;
    }
  }
}

function types_(which) {
  if (!arguments.callee.data) {
    arguments.callee.data = {
      map: G_MAP_TYPE,
      sat: G_SATELLITE_TYPE,
      hyb: G_HYBRID_TYPE
    };
  }
  return arguments.callee.data[which];
}

function maptype(which) {
  map.setMapType(types_(which));
}

function go_(where) {
  if (!arguments.callee.data) {
    arguments.callee.data = {
      us: [new GLatLng(37.160317, -96.152344), 4],
      uk: [new GLatLng(53.159947,-2.438965), 6],
      jp: [new GLatLng(35.685187,139.757423), 14],
      ca: [new GLatLng(51.99841,-95.449219), 4],
      de: [new GLatLng(52.523115,13.409157), 12],
      fr: [new GLatLng(48.856583,2.348671), 12],
      es: [new GLatLng(40.416633,-3.706512), 12],
      it: [new GLatLng(41.894611,12.487335), 12],
      au: [new GLatLng(-33.87013,151.205521), 12],
      nz: [new GLatLng(-41.279998,174.779998), 5],
      oo: [new GLatLng(0, 0), 2]
    };
  }
  return arguments.callee.data[where];
}

function go(where) {
  var place = go_(where);
  map.setCenter(place[0], place[1]);
}

var content_ = {}

function contentMarker() {
  var where = new GLatLng(35.039545, 135.72842);
  var opts = {
    title: "Golden Pavilion Temple, Kyoto"
  };
  var marker = new GMarker(where, opts);
  map.setCenter(where, 17);
  map.addOverlay(marker);
}

function contentPolyline() {
  var points = [
      new GLatLng(13.734508, 100.495892),
      new GLatLng(13.730922, 100.494776),
      new GLatLng(13.728463, 100.501814),
      new GLatLng(13.730089,100.508659)
  ];
  map.setCenter(new GLatLng(13.727, 100.5), 16);
  map.addOverlay(new GPolyline(points));
}

function newMarker(lat, lng, name) {
  var marker = new GMarker(new GLatLng(lat, lng));
  GEvent.addListener(marker, "click", function() {
    marker.openInfoWindowHtml(name);
  });
  return marker;
}

function contentInfoWindow() {
  map.setCenter(new GLatLng(17.97, 78.05), 5);
  map.addOverlay(
      newMarker(28.63, 77.21, "New Delhi"));
}

function contentGeoXml() {
  var site = "http://bbs.keyhole.com";
  var file = "ubb/download.php?Number=50664";
  var geoXml = new GGeoXml(site + "/" + file);
  map.setCenter(new GLatLng(30.5, -98.7), 4);
  map.addOverlay(geoXml);
}

function contentTileLayerOverlay() {
  var stanford = new GTileLayer(
      new GCopyrightCollection(""), 0, 17);
  stanford.getTileUrl = function(tile, zoom) {
    return "http://www.stanford.edu/dept/ucomm/" +
    "map/tiles/base_" + tile.x +
    "_" + tile.y + "_" + zoom + ".png";
  };
  stanford.isPng = function() { return true; };
  var overlay = new GTileLayerOverlay(stanford);
  map.setCenter(new GLatLng(37.42, -122.16), 15);
  map.addOverlay(overlay);
  overlay.show();
}

function contentGroundOverlay() {
  map.setCenter(new GLatLng(37.35, 15.18), 8);
  var etnaBounds = new GLatLngBounds(
      new GLatLng(37.46543388598137, 14.60128369746704),
      new GLatLng(37.91904192681665, 15.35832653742206));
  var groundOverlay = new GGroundOverlay(
      "http://bbs.keyhole.com/ubb/z0302a1700/etna.jpg",
      etnaBounds);
  map.addOverlay(groundOverlay);
}

var trafficOverlay = null;

function contentTraffic(link) {
  if (trafficOverlay) {
    hilite(link, false);
    map.removeOverlay(trafficOverlay);
    trafficOverlay = null;
  } else {
    hilite(link, true);
    trafficOverlay = new GTrafficOverlay;
    map.setCenter(new GLatLng(37.496675,-122.15625), 10);
    map.addOverlay(trafficOverlay);
  }
}

function behaviorMarkerSet() {
  map.setCenter(new GLatLng(39.905523, 116.400146), 13);
  listeners.push(GEvent.addListener(map, "click", function(marker, point) {
    if (marker) {
      map.removeOverlay(marker);
    } else {
      map.addOverlay(new GMarker(point));
    }
  }));
}

function behaviorMarkerMove() {
  map.setCenter(new GLatLng(0, 0), 2);
  var marker = new GMarker(map.getCenter());
  map.addOverlay(marker);
  GEvent.addListener(marker, "mouseover", function() {
    marker.setPoint(new GLatLng(
                        60 * Math.random(),
                        360 * Math.random() - 180));
  });
}

function behaviorMarkerOver() {
  var marker = new GMarker(map.getCenter());
  map.addOverlay(marker);
  GEvent.addListener(marker, "mouseover", function() {
    marker.setImage("lib/marker-yellow.png");
  });
  GEvent.addListener(marker, "mouseout", function() {
    marker.setImage("lib/marker.png");
  });
}

function behaviorMarkerDrag() {
  var marker = new GMarker(map.getCenter(), {
    draggable: true
  });
  marker.enableDragging();
  map.addOverlay(marker);
}

function showAddress(addressinput) {
  if (!arguments.callee.geocoder) {
    arguments.callee.geocoder = new GClientGeocoder;
  }
  var geocoder = arguments.callee.geocoder;
  var address = addressinput.value;
  geocoder.getLatLng(address, function(point) {
    if (point) {
      map.setCenter(point, 13);
      var marker = new GMarker(point);
      map.addOverlay(marker);
      marker.openInfoWindowHtml("Hello " + address + "!");
      addressinput.value = '';
    } else {
      alert('Address not found: ' + address);
    }
  });
}


var directionsPane = null;
var directions = null;

function setUpDirections() {
  if (!directionsPane) {
    directionsPane = new MyPane;
  }
  map.addControl(directionsPane);

  if (!directions) {
    directions = new GDirections(map, directionsPane.getPanel());
    GEvent.addListener(directions, "error", function() {
      alert('Error: ' + this.getStatus().code);
    });
  }
}

function tearDownDirections() {
  map.removeControl(directionsPane);
}

function showDirections(queryinput) {
  directions.load(queryinput.value);
}

function hello(opt_place) {
  var place = loc[opt_place] || loc['default'];
  var point = new GLatLng(place[0], place[1]);
  map.setCenter(point, 2);

  var marker = new GMarker(point);
  map.addOverlay(marker);
  marker.openInfoWindowHtml("Hello World!");
}

function hello0(name, lat, lng) {
  var place = new GLatLng(lat, lng);
  map.setCenter(place, 13);

  var marker = new GMarker(place, { title: name });
  map.addOverlay(marker);

  var greeting = "Hello, " + name;
  GEvent.addListener(marker, 'click', function() {
    this.openInfoWindow(document.createTextNode(greeting));
  });
}

function toggleClickToZoom(elem) {
  if (map.doubleClickZoomEnabled()) {
    map.disableDoubleClickZoom();
  } else {
    map.enableDoubleClickZoom();
  }
  hilite(elem, map.doubleClickZoomEnabled());
}

function toggleContinuousZoom(elem) {
  if (map.continuousZoomEnabled()) {
    map.disableContinuousZoom();
  } else {
    map.enableContinuousZoom();
  }
  hilite(elem, map.continuousZoomEnabled());
}

function toggleScrollWheelZoom(elem) {
  if (map.scrollWheelZoomEnabled()) {
    map.enableScrollWheelZoom();
  } else {
    map.disableScrollWheelZoom();
  }
  hilite(elem, map.scrollWheelZoomEnabled());
}

function hilite(elem, on) {
  if (on) {
    elem.style.color = '#f7d417';
  } else {
    elem.style.color = '';
  }
  elem.blur();
}

function MyPane() {}

if (typeof GControl != 'undefined') {
  MyPane.prototype = new GControl;
}

MyPane.prototype.initialize = function(map) {
  var me = this;
  me.panel = document.createElement("div");
  me.panel.style.width = "300px";
  me.panel.style.height = "400px";
  me.panel.style.backgroundColor = "#fffff0";
  me.panel.style.border = "1px solid gray";
  me.panel.style.overflow = "auto";
  me.panel.style.fontSize = "70%";
  map.getContainer().appendChild(me.panel);
  return me.panel;
};

MyPane.prototype.getDefaultPosition = function() {
  return new GControlPosition(
      G_ANCHOR_TOP_RIGHT, new GSize(10, 50));
};

MyPane.prototype.getPanel = function() {
  return this.panel;
};
