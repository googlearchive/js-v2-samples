function PhotoLayerCallback(json, panoLayer) {
  this.panoLayer = panoLayer;
  var photos = this.getPhotos(json);
  if (!photos) return;
  var batch = [];
 for (var i = 0; i < photos.length; i++) {
    var photo = photos[i];
    if (!panoLayer.ids[this.getId(photo)]) {
      var marker = this.createMarker(photo, panoLayer.markerIcon);
      panoLayer.ids[this.getId(photo)] = "exists";
      batch.push(marker);
      panoLayer.mgr.addMarker(marker, panoLayer.map.getZoom());
    } 
  }
}

PhotoLayerCallback.prototype.getPhotos = function(json) {
  return (json.feed && json.feed.entry) || (json.photos && json.photos.photo);
}

PhotoLayerCallback.prototype.getId = function(photo) {
  return (photo.id && photo.id.$t) || (photo.id);
}

PhotoLayerCallback.prototype.getTitle = function(photo) {
  return (photo.title && photo.title.$t) || (photo.title);
}

PhotoLayerCallback.prototype.getThumbnailUrl = function(photo) {
  return (photo.media$group && photo.media$group.media$thumbnail[0].url) || 
    ("http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + "s.jpg");
}

PhotoLayerCallback.prototype.getImageUrl = function(photo) {
  return (photo.media$group && photo.media$group.media$thumbnail[2].url) || 
    ("http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + "m.jpg");
}

PhotoLayerCallback.prototype.getLatLng = function(photo) {
  if (photo.georss$where) {
    var pos = photo.georss$where.gml$Point.gml$pos.$t;
    var lat = parseFloat(pos.split(" ")[0]);
    var lng = parseFloat(pos.split(" ")[1]);
  } else {
    var lat = parseFloat(photo.latitude);
    var lng = parseFloat(photo.longitude);
  }
  return new GLatLng(lat, lng);
}

PhotoLayerCallback.prototype.getDescription = function(photo) {
  return (photo.summary && photo.summary.$t) || "";
}

PhotoLayerCallback.prototype.getAuthor = function(photo) {
  return (photo.author && photo.author[0] && photo.author[0].name.$t) || photo.ownername;
}

PhotoLayerCallback.prototype.getLink = function(photo) { 
  return (photo.link && photo.link[1] && photo.link[1].href) || 
    ("http://www.flickr.com/photos/" + photo.owner + "/" + photo.id);
}

PhotoLayerCallback.prototype.createMarker = function(photo, baseIcon) {
  var me = this;
  var title = this.getTitle(photo);
  var description = this.getDescription(photo);
  var author = this.getAuthor(photo);
  var link = this.getLink(photo);
  var thumbnailUrl = this.getThumbnailUrl(photo);
  var imageUrl = this.getImageUrl(photo);

  var markerIcon = new GIcon(baseIcon);
  markerIcon.image = thumbnailUrl;
  var marker = new MarkerLight(this.getLatLng(photo), 
      {image: thumbnailUrl, 
       title: title, 
       zIndexProcess: function(m) { 
         return GOverlay.getZIndex(m.getPoint().lat())-m.clickedCount*10000;}
      });

  if (title > 33) {
    title = title.substring(0, 33) + "&#8230;";
  }
  var html = "<div id='infowin' style='height:300px;width:350px;'><br/>" +
             "<a id='photo_infowin' target='_blank' href='" + link + "'>" +                
             "<img border='0' src='" + imageUrl + "'/><\/a>" +
             "<div style='overflow: hidden;'>" +
             "<p><a target='_blank' class='photo_title' href='" + link +
             "'><strong>" + title + "<\/strong><\/a></p><p>" + description + "</p>" +
             "<p>Posted by " + author + "</p><\/div>" +
             "<\/div>";

  marker.html = html;
  marker.clickedCount = 0;
  GEvent.addListener(marker, "click", function() {
    marker.clickedCount++;
    me.panoLayer.map.openInfoWindow(marker.getPoint(), marker.html, {pixelOffset: new GSize(16, -16), noCloseOnClick: true});
  });
 
  return marker;
}


function PhotoLayer(map, opt_opts) {
  var me = this;
  me.map = map;
  me.ids = {};
  me.mgr = new MarkerManager(map, {maxZoom: 19});

  var icon = new GIcon();
  icon.image = "http://www.panoramio.com/img/panoramio-marker.png"; 
  icon.shadow = "http://pamela.fox.googlepages.com/squareoutline.png";  
  icon.iconSize = new GSize(30, 30); 
  icon.shadowSize = new GSize(35, 35); 
  icon.iconAnchor = new GPoint(9, 9);  
  icon.infoWindowAnchor = new GPoint(9, 0); 

  me.markerIcon = icon;
  me.enabled = false;

  GEvent.addListener(map, "moveend", function() {
    if (me.enabled) {
      var bounds = map.getBounds();
      var southWest = bounds.getSouthWest();
      var northEast = bounds.getNorthEast();
      me.load(me, {north: northEast.lat(), south: southWest.lat(), east: northEast.lng(), west: southWest.lng()});
    }
  });
}

PhotoLayer.prototype.enable = function() {
  this.enabled = true;
  GEvent.trigger(map, "moveend");
}

PhotoLayer.prototype.disable = function() {
  this.enabled = false;
  this.mgr.clearMarkers();
  this.ids = {};
}

PhotoLayer.prototype.getEnabled = function() {
  return this.enabled;
}

PhotoLayer.prototype.load = function(panoLayer, options) {
  var uniqueID = "";
 
  for (optionName in options) {
    if (options.hasOwnProperty(optionName)) {
      var optionVal = "" + options[optionName] + "";
      url += optionName + "=" + optionVal + "&";
      uniqueID += optionVal.replace(/[^\w]+/g,"");
    }
  }
  var url =
  "http://picasaweb.google.com/data/feed/api/all?kind=photo&tag=eye-fi&bbox=" + 
    options.west + "," + options.south + "," + options.east + "," + options.north + 
    "&max-results=20&alt=json-in-script&";
 
  var callbackName = "PhotoLayerCallback.loader" + uniqueID; //ask dion
  eval(callbackName + " = function(json) { var pa = new PhotoLayerCallback(json, panoLayer);}");
 
  var script = document.createElement('script');
  script.setAttribute('src', url + 'callback=' + callbackName);
  script.setAttribute('type', 'text/javascript');
//  document.documentElement.firstChild.appendChild(script);

  var url =
  "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a0de4a213ab1191732ec4db4daf586a3&extras=geo,owner_name&tags=eye-fi&sort=interestingness-desc&per_page=20&bbox=" + options.west + "," + options.south + "," + options.east + "," + options.north + "&format=json&";
   
  var callbackName = "PhotoLayerCallback.loader" + uniqueID; //ask dion
  eval(callbackName + " = function(json) { var pa = new PhotoLayerCallback(json, panoLayer);}");
 
  var script = document.createElement('script');
  script.setAttribute('src', url + 'jsoncallback=' + callbackName);
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}

