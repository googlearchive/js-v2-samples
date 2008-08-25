function SpreadsheetsLayerCallback(json, spreadsheetsLayer) {
  var bounds = new GLatLngBounds();       

  for (var i = 0; i < json.feed.entry.length; i++) {
    var entry = json.feed.entry[i];
    if(entry["gsx$" + spreadsheetsLayer.options.column_lat]) {
      var label = this.getColumnVal(entry, spreadsheetsLayer.options.column_title);
      var url = this.getColumnVal(entry, spreadsheetsLayer.options.column_desc);

      var lat = parseFloat(this.getColumnVal(entry, spreadsheetsLayer.options.column_lat));
      var lng = parseFloat(this.getColumnVal(entry, spreadsheetsLayer.options.column_lng));
      var latlng = new GLatLng(lat, lng);

      var div = document.createElement('div');
      div.innerHTML += '<strong>' + this.getColumnVal(entry, spreadsheetsLayer.options.column_title) + '</strong><br/>';
      var link = document.createElement('a');
      link.href = url;
      link.target = '_blank'; 
      link.appendChild(document.createTextNode('Click to watch video'));
      div.appendChild(link);

      var marker = this.createMarker(spreadsheetsLayer, latlng, label, div);
      spreadsheetsLayer.mgr.addMarker(marker, 0);
      bounds.extend(latlng);
    }
  }
}

SpreadsheetsLayerCallback.prototype.getColumnVal = function(entry, columnName) {
  var columnVal = '';
  if (entry["gsx$" + columnName]) {
    columnVal = entry["gsx$" + columnName].$t;
  }
  return columnVal;
}

SpreadsheetsLayerCallback.prototype.createMarker = function(spreadsheetsLayer, latlng, label, div) {
  var marker = new GMarker(latlng, {icon: spreadsheetsLayer.markerIcon, title: label});

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
    icon_color: "green"
  };

  for (optionName in userOptions) {
    if (userOptions.hasOwnProperty(optionName)) {
      me.options[optionName] = userOptions[optionName];
    }
  }

  me.mgr = new MarkerManager(map, {maxZoom: 19});

  var icon = new GIcon(G_DEFAULT_ICON);
  icon.image = 'http://www.google.org/recharge/video.png';
  icon.shadow = null;
  icon.iconSize = new GSize(22, 21);
  icon.shadowSize = new GSize(0, 0);
  icon.iconAnchor = new GPoint(10, 10);
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
  script.setAttribute('src', 'http://spreadsheets.google.com/feeds/list'
                         + '/' + me.options.key + '/' + me.options.id + '/public/values' +
                        '?alt=json-in-script&callback=' + callbackName + '&' + me.options.query);
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}
