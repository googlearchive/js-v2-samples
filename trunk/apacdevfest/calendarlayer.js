function SpreadsheetsLayerCallback(json, spreadsheetsLayer) {
  var bounds = new GLatLngBounds();       
  this.lastMousedOver = null;

  for (var i = 0; i < json.feed.entry.length; i++) {
    var entry = json.feed.entry[i];
    var title = entry.title.$t;
    var content = entry.content.$t || "";
    if (content.length > 300)
        content = content.substring(0, 300) + '...';
    var infoHtml = '<div style="height:100px;margin-top:5px;padding:10px;">' +
        '<strong>' + entry.title.$t + '</strong>' + '<br/>' + entry.gd$when[0].startTime  + '<p>' + content + '</p>' +
        '</div>';
    var start = entry.gd$when[0].startTime;
    // get geolocation
    var location = entry.gd$where[0].valueString;
    var pattern = new RegExp(/@\s*([\-0-9.]+)\s*,\s*([\-0-9.]+)\s*/);
    var matches = pattern.exec(location);
    if (matches != null) {
        var lat = parseFloat(matches[1]);
        var lng = parseFloat(matches[2]);
        var latlng = new GLatLng(lat, lng);

        var div = document.createElement('div');
        div.innerHTML += infoHtml;

        var sidebar_div = document.createElement('div');
        var city = title.split(" DevFest")[0].toUpperCase(); 
        sidebar_div.innerHTML = '<div style="color: rgb(255, 255, 255); cursor: pointer; font-weight: bold; font-size: 24px; padding-left: 10px; padding-top: 10px;">' + city + '</div><div style="padding-right:10px;text-align: right; color: rgb(255, 255, 255); font-style: italic; font-size: 12px;">' + start + '</div>';
        var marker = this.createMarker(spreadsheetsLayer, latlng, title, div, sidebar_div);
        spreadsheetsLayer.mgr.addMarker(marker, 0);
        bounds.extend(latlng);
        spreadsheetsLayer.options.sidebar.appendChild(sidebar_div);
    }
  }
  spreadsheetsLayer.map.setCenter(bounds.getCenter(), spreadsheetsLayer.map.getBoundsZoomLevel(bounds));
}


SpreadsheetsLayerCallback.prototype.createMarker = function(spreadsheetsLayer, latlng, label, div, sidebar_div) {
  var me = this;
  var marker = new GMarker(latlng, {icon: spreadsheetsLayer.markerIcon, title: label});
  var colors = ["#ff0000", "#00ff00", "#0000ff", "#ffcc00"];
  var color = "";

  GEvent.addDomListener(sidebar_div, "mouseover", function() {
    if (me.lastMousedOver != sidebar_div) {
      var rand = Math.ceil(4*Math.random())-1;
      color = colors[rand];
    }
    sidebar_div.style.backgroundColor = color;
    me.lastMousedOver = sidebar_div;
  });

  GEvent.addDomListener(sidebar_div, "mouseout", function() {
    sidebar_div.style.backgroundColor = "#000";
  });

  GEvent.addDomListener(sidebar_div, "click", function() {
    marker.openInfoWindow(div);
  });

  GEvent.addListener(marker, "mouseover", function() {
    var rand = Math.ceil(4*Math.random())-1;
    color = colors[rand];
    sidebar_div.style.backgroundColor = color;
  });

  GEvent.addListener(marker, "mouseout", function() {
    sidebar_div.style.backgroundColor = "#000";
  });

  GEvent.addListener(marker, "click", function() {
    marker.openInfoWindow(div);
  });
  return marker;
}


function SpreadsheetsLayer(map, userOptions) {
  var me = this;
  me.ids = {};
  me.map = map;
  me.options = {
    key: 'p9pdwsai2hDM44qo4oZ5EfQ',
    id: 'od6',
    query: '',
    video_width: '400px',
    video_height: '300px',
    column_title: "title",
    column_desc: "description",
    column_lat: "latitude",
    column_lng: "longitude",
    icon_color: "green",
    url: "",
    sidebar: null
  };

  for (optionName in userOptions) {
    if (userOptions.hasOwnProperty(optionName)) {
      me.options[optionName] = userOptions[optionName];
    }
  }

  me.mgr = new MarkerManager(map, {maxZoom: 19});

  var icon = new GIcon();
  icon.image = 'http://pamela.fox.googlepages.com/mapsicon.png';
  icon.shadow = null;
  icon.iconSize = new GSize(32, 32);
  icon.shadowSize = new GSize(0, 0);
  icon.iconAnchor = new GPoint(16, 16);
  icon.infoWindowAnchor = new GPoint(9, 2);
  icon.infoShadowAnchor = new GPoint(18, 15);
  me.markerIcon = icon;

  me.enabled = false;
}

SpreadsheetsLayer.prototype.enable = function() {
  this.enabled = true;
  this.load();
}

SpreadsheetsLayer.prototype.disable = function() {
  this.enabled = false;
  this.mgr.clearMarkers();
  this.ids = {};
}

SpreadsheetsLayer.prototype.getEnabled = function() {
  return this.enabled;
}

SpreadsheetsLayer.prototype.load = function() {
  var me = this; 
  var uniqueID = "";
  for (optionName in me.options) {
    if (me.options.hasOwnProperty(optionName)) {
      var optionVal = "" + me.options[optionName] + "";
      uniqueID += optionVal.replace(/[^\w]+/g,"");
    }
  }
  var callbackName = "SpreadsheetsLayerCallback.loader" + uniqueID; 
  eval(callbackName + " = function(json) { var pa = new SpreadsheetsLayerCallback(json, me);}");
 
  var script = document.createElement('script');
  script.setAttribute('src', me.options.url +  
                        '&alt=json-in-script&callback=' + callbackName + '&' + me.options.query);
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}
