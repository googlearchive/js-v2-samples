/*! 
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the GNU General Public License
 * (see LICENSE.txt or http://www.gnu.org/licenses)
 */

/**---------------------------------------------------------------------------
 * TimeMap
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * The TimeMap object is intended to sync a SIMILE Timeline with a Google Map.
 * Dependencies: Google Maps API v2, SIMILE Timeline v1.2
 * Thanks to Jörn Clausen (http://www.oe-files.de) for initial concept and code.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *---------------------------------------------------------------------------*/

 
/*----------------------------------------------------------------------------
 * TimeMap Class - holds references to timeline, map, and datasets
 *---------------------------------------------------------------------------*/
 
/**
 * Creates a new TimeMap with map placemarks synched to timeline events
 * This will create the visible map, but not the timeline, which must be initialized separately.
 *
 * @constructor
 * @param {element} tElement     The timeline element.
 * @param {element} mElement     The map element.
 * @param {Object} options       A container for optional arguments:
 *   {Boolean} syncBands            Whether to synchronize all bands in timeline
 *   {GLatLng} mapCenter            Point for map center
 *   {Number} mapZoom               Intial map zoom level
 *   {GMapType} mapType             The maptype for the map
 *   {Boolean} showMapTypeCtrl      Whether to display the map type control
 *   {Boolean} showMapCtrl          Whether to show map navigation control
 *   {Boolean} hidePastFuture       Whether to hide map placemarks for events not visible on timeline
 *   {Boolean} centerMapOnItems     Whether to center and zoom the map based on loaded item positions
 *   {Function} openInfoWindow      Function redefining how info window opens
 *   {Function} closeInfoWindow     Function redefining how info window closes
 */
function TimeMap(tElement, mElement, options) {
    // save elements
    this.mElement = mElement;
    this.tElement = tElement;
    // initialize array of datasets
    this.datasets = {};
    // initialize map bounds
    this.mapBounds = new GLatLngBounds();
    
    // set defaults for options
    // other options can be set directly on the map or timeline
    this.opts = options || {}; // make sure the options object isn't null
    this.opts.syncBands =        options['syncBands'] || true;
    this.opts.mapCenter =        options['mapCenter'] || new GLatLng(0,0); 
    this.opts.mapZoom =          options['mapZoom'] || 0;
    this.opts.mapType =          options['mapType'] || G_PHYSICAL_MAP;
    this.opts.showMapTypeCtrl =  options['showMapTypeCtrl'] || true;
    this.opts.showMapCtrl =      options['showMapCtrl'] || true;
    this.opts.hidePastFuture =   options['hidePastFuture'] || true;
    this.opts.centerMapOnItems = options['centerMapOnItems'] || true;
    
    // initialize map
    if (GBrowserIsCompatible()) {
        this.map = new GMap2(this.mElement);
        if (this.opts.showMapCtrl)
            this.map.addControl(new GLargeMapControl());
        if (this.opts.showMapTypeCtrl)
            this.map.addControl(new GMapTypeControl());
        this.map.addMapType(G_PHYSICAL_MAP);
        this.map.removeMapType(G_HYBRID_MAP);
        this.map.enableDoubleClickZoom();
        this.map.enableScrollWheelZoom();
        this.map.enableContinuousZoom();
        // initialize map center and zoom
        this.map.setCenter(this.opts.mapCenter, this.opts.mapZoom);
        // must be called after setCenter, for reasons unclear
        this.map.setMapType(this.opts.mapType);
    }
    
    // hijack popup window callback to open info window
    Timeline.DurationEventPainter.prototype._showBubble = function(x, y, evt) {
        evt.item.openInfoWindow();
    }
}

/**
 * Create an empty dataset object and add it to the timemap
 *
 * @param {String} id           The id of the dataset
 * @param {Object} options      A container for optional arguments for dataset constructor
 * @return {TimeMapDataset}     The new dataset object    
 */
TimeMap.prototype.createDataset = function(id, options) {
    options = options || {}; // make sure the options object isn't null
    if(!("title" in options)) options["title"] = id;
    var dataset = new TimeMapDataset(this, options);
    this.datasets[id] = dataset;
    return dataset;
}

/**
 * Initialize the timeline - this must happen separately to allow full control of 
 * timeline properties.
 *
 * @param {BandInfo Array} bands    Array of band information objects for timeline
 */
TimeMap.prototype.initTimeline = function(bands) {
    
    // synchronize & highlight timeline bands
    for (var x=1; x < bands.length; x++) {
        if (this.opts.syncBands)
            bands[x].syncWith = (x-1);
        bands[x].highlight = true;
    }
    
    // initialize timeline
    this.timeline = Timeline.create(this.tElement, bands);
    
    // set event listener to hide off-timeline items on the map
    if (this.opts.hidePastFuture) {
        var topband = this.timeline.getBand(0);
        var datasets = this.datasets;
        var oMap = this.map;
        topband.addOnScrollListener(function() {
            var maxVisibleDate = topband.getMaxVisibleDate().getTime();
            var minVisibleDate = topband.getMinVisibleDate().getTime();
            for (id in datasets) {
                var items = datasets[id].getItems();
                for (var x=0; x < items.length; x++) {
                    if (items[x].event != null && items[x].placemark instanceof GOverlay) {
                        var itemStart = items[x].event.getStart().getTime();
                        var itemEnd = items[x].event.getEnd().getTime();
                        // hide items in the future
                        if (itemStart > maxVisibleDate) {
                            items[x].placemark.hide();
                            items[x].closeInfoWindow();
                        } 
                        // hide items in the past
                        else if (itemEnd < minVisibleDate || 
                            (items[x].event.isInstant() && itemStart < minVisibleDate)) {
                            items[x].placemark.hide();
                            items[x].closeInfoWindow();
                        } 
                        else items[x].placemark.show();
                    }
                }
            }
        });
    }
    
    // set event listener to hide off-map items on the timeline
    if (this.opts.hideOffMap) {
        var datasets = this.datasets;
        var oMap = this.map;
        GEvent.addListener(oMap, "moveend", function() {
            var bounds = oMap.getBounds();
            for (id in datasets) {
                var items = datasets[id].getItems();
                for (var x=0; x < items.length; x++) {
                    var placemarkPoint = items[x].placemark.getLatLng();
                    // hide events outside map bounds
                    if (!bounds.containsLatLng(placemarkPoint) && items[x].event != null)
                        items[x].event.hide();
                    else items[x].event.show();
                }
            }
        });
    }
    
    // add callback for window resize here instead of the html file, to conform with XHTML 1.0
    resizeTimerID = null;
    var oTImeline = this.timeline;
    window.onresize = function() {
        if (resizeTimerID == null) {
            resizeTimerID = window.setTimeout(function() {
                resizeTimerID = null;
                oTImeline.layout();
            }, 500);
        }
    };
};

/**
 * Create a legend with the current datasets, using an existing DOM element.
 * This relies on the color property being set for each dataset
 * XXX: still depends on jQuery...
 *
 * @param {String} legendId        The id of the legend element.
 */
TimeMap.prototype.createLegend = function(legendId) {
    legendId = "#"+legendId;
    for (id in this.datasets) {
        var dataset = this.datasets[id];
        var colorBox = '<div style="float:left;margin-right:5px;border:1px solid #000;width:12px;height:12px;background:' + dataset.opts.theme.color + '">&nbsp;</div>';
        var divHtml = '<div class="legenditem">' + colorBox+dataset.title + '</div>';
        $(legendId).append(divHtml);
    }
}

/*----------------------------------------------------------------------------
 * TimeMapDataset Class - holds references to items and visual themes
 *---------------------------------------------------------------------------*/

/**
 * Create a new TimeMap dataset to hold a set of items
 *
 * @constructor
 * @param {TimeMap} timemap         Reference to the timemap object
 * @param {Object} options          Object holding optional arguments:
 *   {String} title                     Title of the dataset (for the legend)
 *   {TimeMapDatasetTheme} theme        Theme settings
 *   {Function} dateParser              Function to replace default date parser
 *   {Function} openInfoWindow          Function redefining how info window opens
 *   {Function} closeInfoWindow         Function redefining how info window closes
 */
function TimeMapDataset(timemap, options) {
    // hold reference to timemap
    this.timemap = timemap;
    // initialize timeline event source
    this.eventSource = new Timeline.DefaultEventSource();
    // initialize array of items
    this.items = [];
    
    // set defaults for options
    this.opts = options || {}; // make sure the options object isn't null
    this.opts.title =        options["title"] || "";
    this.opts.theme =        options["theme"] || new TimeMapDatasetTheme({});
    // allow for other data parsers (e.g. Gregorgian)
    this.opts.dateParser =   options["dateParser"] || Timeline.DateTime.parseIso8601DateTime;
}

/*
 * Get the items for this dataset
 */
TimeMapDataset.prototype.getItems = function() {
    return this.items;
}


/*
 * Add items to map and timeline. 
 * Each item has both a timeline event and a map placemark.
 *
 * @param {Object} data             Data to be loaded. See loadItem() below for the format.
 * @param {Function} transform      If data is not in the above format, transformation function to make it so
 */
TimeMapDataset.prototype.loadItems = function(data, transform) {
    for (var x=0; x < data.length; x++) {
        this.loadItem(data[x], transform);
    }
    var tm = this.timemap;
    // XXX - probably change to this.timemap.onLoadItems()
    if  (tm.opts.centerMapOnItems) {
        // determine the zoom level from the bounds
        tm.map.setZoom(tm.map.getBoundsZoomLevel(tm.mapBounds));
        // determine the center from the bounds
        tm.map.setCenter(tm.mapBounds.getCenter());
    }
};

/*
 * Add one item to map and timeline. 
 * Each item has both a timeline event and a map placemark.
 *
 * @param {Object} data             Data to be loaded, in the following format:
 *      {String} title                  Title of the item (visible on timeline)
 *      {DateTime} start         Start time of the event on the timeline
 *      {DateTime} end           End time of the event on the timeline (duration events only)
 *      {Object} point                  Data for a single-point placemark: 
 *          {Float} lat                   Latitude of map marker
 *          {Float} lon                   Longitude of map marker
 *      {Array of points} polyline      Data for a polyline placemark, in format above
 *      {Array of points} polygon       Data for a polygon placemark, in format above
 *      {Object} options                Optional arguments to be passed to the TimeMapItem:
 *          {String} description            Description to be shown in the info window
 *          {String} infoHtml               Full HTML for the info window, defaults to title + description
 *          {String} infoUrl                URL from which to retrieve full HTML for the info window
 *          {String} maxInfoHtml            Full HTML for the maximized info window
 *          {String} maxInfoUrl             URL from which to retrieve full HTML for the maximized info window
 *          {String} maxOnly                Whether to auto-maximize on open
 *          {TimeMapDatasetTheme} theme     Theme to apply to this item (overriding dataset theme)
 * @param {Function} transform      If data is not in the above format, transformation function to make it so
 */
TimeMapDataset.prototype.loadItem = function(data, transform) {
    // apply transformation, if any
    if (transform != undefined)
        data = transform(data);
    // transform functions can return a null value to skip a datum in the set
    if (data == null) return;
    
    // use item theme if provided, defaulting to dataset theme
    var theme = data.options["theme"] || this.opts.theme;
    
    var tm = this.timemap;
    
    // create timeline event
    var start = (data.start == undefined||data.start == "") ? null :
        this.opts.dateParser(data.start);
    var end = (data.end == undefined||data.end == "") ? null : 
        this.opts.dateParser(data.end);
    var instant = (data.end == undefined);
    var eventIcon = instant ? theme.eventIcon : null;
    var title = data.title;
    // allow event-less placemarks - these will be always present
    if (start != null)
        var event = new Timeline.DefaultEventSource.Event(start, end, null, null,
                                                      instant, title, null, null, null, 
                                                      eventIcon, theme.eventColor, null);
    else var event = null;
    
    // create map placemark
    var placemark = null;
    var type = "";
    var point = null;
    // point placemark
    if ("point" in data) {
        point = new GLatLng(
            parseFloat(data.point["lat"]), 
            parseFloat(data.point["lon"])
        );
        // add point to visible map bounds
        if (tm.opts.centerMapOnItems) {
            tm.mapBounds.extend(point);
        }
        markerIcon = ("icon" in data) ? data["icon"] : theme.icon;
        placemark = new GMarker(point, { icon: markerIcon });
        type = "marker";
    } else if ("polyline" in data || "polygon" in data) {
        var points = [];
        if ("polyline" in data)
            var line = data.polyline;
        else var line = data.polygon;
        for (var x=0; x<line.length; x++) {
            point = new GLatLng(
                parseFloat(line[x]["lat"]), 
                parseFloat(line[x]["lon"])
            );
            points.push(point);
            // add point to visible map bounds
            if (tm.opts.centerMapOnItems) {
                tm.mapBounds.extend(point);
            }
        }
        if ("polyline" in data) {
            placemark = new GPolyline(points, 
                                      theme.lineColor, 
                                      theme.lineWeight,
                                      theme.lineOpacity);
            type = "polyline";
        } else {
            placemark = new GPolygon(points, 
                                     theme.polygonLineColor, 
                                     theme.polygonLineWeight,
                                     theme.polygonLineOpacity,
                                     theme.fillColor,
                                     theme.fillOpacity);
            type = "polygon";
        }
    }
     // XXX: It would be nice to handle missing placemarks better
    if (placemark == null) {
        markerIcon = ("icon" in data) ? data["icon"] : theme.icon;
        placemark = {};
    }
    
    // define the center point of this item
    if (type == "marker") {
        // just the marker point
        point = placemark.getLatLng();
    } else if (type == "polyline") {
        // the middle vertex of the line
        point = placemark.getVertex(Math.floor(placemark.getVertexCount()/2));
    } else if (type == "polygon") {
        // the middle of the polygon bounds
        point = placemark.getBounds().getCenter();
    } else {
       point = new GLatLng(0, 0);
    }
    
    var options = data.options || {};
    options["title"] = title;
    options["type"] = type;
    options["infoPoint"] = point;
    
    // create item and cross-references
    var item = new TimeMapItem(placemark, event, this, options);
    if (event != null) {
        event.placemark = placemark;
        event.item = item;
    }
    placemark.event = event;
    placemark.item = item;
    
    this.items.push(item);
    
    // add listener to make placemark open when event is clicked
    var oMap = tm.map;
    GEvent.addListener(placemark, "click", function() {
        item.openInfoWindow();
    });
    
    // add placemark and event to map and timeline
    if (placemark instanceof GOverlay) {
      tm.map.addOverlay(placemark);
    }
    if (event != null)
        this.eventSource.add(event);
};

/*
 * Static function to parse KML with time data and load it.
 *
 * @param {XML text} kml        KML to be parsed
 */
TimeMapDataset.parseKML = function(kml) {
    var items = [];
    kmlnode = GXml.parse(kml);
    var placemarks = kmlnode.getElementsByTagName("Placemark");
    var timeCheck = false;
    for (var i=0; i<placemarks.length; i++) {
        var pm = placemarks[i];
        var nList, data = {};
        // get title
        nList = pm.getElementsByTagName("name");
        if (nList.length > 0) {
            data["title"] = nList[0].firstChild.nodeValue;
        }
        // get description
        nList = pm.getElementsByTagName("description");
        data.options = {};
        if (nList.length > 0) {
            data.options["description"] = nList[0].firstChild.nodeValue;
        }
        // look for instant timestamp
        nList = pm.getElementsByTagName("TimeStamp");
        if (nList.length > 0) {
            data["start"] = nList[0].getElementsByTagName("when")[0].firstChild.nodeValue;
            timeCheck = true;
        }
        // otherwise look for span
        if (!timeCheck) {
            nList = pm.getElementsByTagName("TimeSpan");
            if (nList.length > 0) {
                data["start"] = nList[0].getElementsByTagName("begin")[0].firstChild.nodeValue;
                data["end"] = nList[0].getElementsByTagName("end")[0].firstChild.nodeValue;
                timeCheck = true;
            }
        }
        if (!timeCheck) {
          data.push(TimeMapDataset.parseParentNode(pm));
        }
        // look for marker
        nList = pm.getElementsByTagName("Point");
        if (nList.length > 0) {
            data["point"] = {};
            // get lat/lon
            var coords = nList[0].getElementsByTagName("coordinates")[0].firstChild.nodeValue;
            var latlon = coords.split(",");
            data["point"] = {
                "lat": trim(latlon[1]),
                "lon": trim(latlon[0])
            };
        }
        // look for polyline / polygon
        else {
            nList = pm.getElementsByTagName("LineString");
            if (nList.length > 0) {
                data["polyline"] = [];
                var coords = nList[0].getElementsByTagName("coordinates")[0].firstChild.nodeValue;
                var coordArr = trim(coords).split(/[\r\n\f]+/);
                for (var x=0; x<coordArr.length; x++) {
                    var latlon = coordArr[x].split(",");
                    data["polyline"].push({
                        "lat": trim(latlon[1]),
                        "lon": trim(latlon[0])
                    });
                }
            } else {
                nList = pm.getElementsByTagName("Polygon");
                if (nList.length > 0) {
                    data["polyline"] = [];
                    var coords = nList[0].getElementsByTagName("coordinates")[0].firstChild.nodeValue;
                    var coordArr = trim(coords).split(/[\r\n\f]+/);
                    for (var x=0; x<coordArr.length; x++) {
                        var latlon = coordArr[x].split(",");
                        data["polyline"].push({
                            "lat": trim(latlon[1]),
                            "lon": trim(latlon[0])
                        });
                    }
                }
            }
        }
        items.push(data);
    }
    kmlnode = null;
    nList = null;
    return items;
}


TimeMapDataset.parseParentNode = function(pm){
  check = false;
  var data = {};
  pn = pm.parentNode;
  if (pn.nodename == "Folder" || pn.nodename=="Document"){
    for (ele in pn.childNodes) {
      if (ele.nodename == "TimeStamp") {
        data["start"] = ele.getElementsByTagName("when")[0].firstChild.nodeValue;
        check = true;
      }
      else if (ele.nodename = "TimeStamp"){
        beginNodes = ele.getElementsByTagName("begin");
        if (beginNodes.length > 0) data["start"] = beginNodes[0].firstChild.nodeValue;
        if (endNodes.length > 0) data["end"] = endNodes[0].firstChild.nodeValue;
        check = true;
      }
    }
  }
  else check = true;
  if (!check) {
    data = TimeMapDataset.parseParentNode(pn);
  }
         
  return data;
}

/*----------------------------------------------------------------------------
 * Predefined visual themes for datasets, based on Google markers
 *---------------------------------------------------------------------------*/
 
/**
 * Create a new theme for a TimeMap dataset, defining colors and images
 *
 * @constructor
 * @param {Object} options          A container for optional arguments:
 *      {GIcon} icon                    Icon for marker placemarks
 *      {String} color                  Default color in hex for events, polylines, polygons
 *      {String} lineColor              Color for polylines, defaults to options.color
 *      {String} polygonLineColor       Color for polygon outlines, defaults to lineColor
 *      {Number} lineOpacity            Opacity for polylines
 *      {Number} polgonLineOpacity      Opacity for polygon outlines, defaults to options.lineOpacity
 *      {Number} lineWeight             Line weight in pixels for polylines
 *      {Number} polygonLineWeight      Line weight for polygon outlines, defaults to options.lineWeight
 *      {String} fillColor              Color for polygon fill, defaults to options.color
 *      {String} fillOpacity            Opacity for polygon fill
 *      {String} eventColor             Background color for duration events
 *      {URL} eventIcon                 Icon URL for instant events
 */
function TimeMapDatasetTheme(options) {
    // work out various defaults - the default theme is Google's reddish color
    options = options || {};
    this.icon =              options['icon'] || G_DEFAULT_ICON;
    this.color =             options['color'] || "#FE766A";
    this.lineColor =         options['lineColor'] || this.color;
    this.polygonLineColor =  options['polygonLineColor'] || this.lineColor;
    this.lineOpacity =       options['lineOpacity'] || 1;
    this.polgonLineOpacity = options['polgonLineOpacity'] || this.lineOpacity;
    this.lineWeight =        options['lineWeight'] || 2;
    this.polygonLineWeight = options['polygonLineWeight'] || this.lineWeight;
    this.fillColor =         options['fillColor'] || this.color;
    this.fillOpacity =       options['fillOpacity'] || 0.25;
    this.eventColor =        options['eventColor'] || this.color;
    this.eventIconPath =     options['eventIconPath'] || "images/";
    this.eventIconImage =    options['eventIconImage'] || "red-circle.png";
    this.eventIcon =         options['eventIcon'] || this.eventIconPath + this.eventIconImage;
}

TimeMapDataset.redTheme = function(options) {
    return new TimeMapDatasetTheme(options);
}

TimeMapDataset.blueTheme = function(options) {
    options = options || {};
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/blue-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    options['icon'] =           markerIcon;
    options['color'] =          "#5A7ACF";
    options['eventIconImage'] = "blue-circle.png";
    return new TimeMapDatasetTheme(options);
}

TimeMapDataset.greenTheme = function(options) {
    options = options || {};
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/green-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    options['icon'] =           markerIcon;
    options['color'] =          "#19CF54";
    options['eventIconImage'] = "green-circle.png";
    return new TimeMapDatasetTheme(options);
}

TimeMapDataset.ltblueTheme = function(options) {
    options = options || {};
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/ltblue-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    options['icon'] =           markerIcon;
    options['color'] =          "#5ACFCF";
    options['eventIconImage'] = "ltblue-circle.png";
    return new TimeMapDatasetTheme(options);
}

TimeMapDataset.purpleTheme = function(options) {
    options = options || {};
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/purple-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    options['icon'] =           markerIcon;
    options['color'] =          "#8E67FD";
    options['eventIconImage'] = "purple-circle.png";
    return new TimeMapDatasetTheme(options);
}

TimeMapDataset.orangeTheme = function(options) {
    options = options || {};
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/orange-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    options['icon'] =           markerIcon;
    options['color'] =          "#FF9900";
    options['eventIconImage'] = "orange-circle.png";
    return new TimeMapDatasetTheme(options);
}

TimeMapDataset.yellowTheme = function(options) {
    options = options || {};
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/yellow-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    options['icon'] =           markerIcon;
    options['color'] =          "#ECE64A";
    options['eventIconImage'] = "yellow-circle.png";
    return new TimeMapDatasetTheme(options);
}
 


/*----------------------------------------------------------------------------
 * TimeMapItem Class - holds references to map placemark and timeline event
 *---------------------------------------------------------------------------*/

/**
 * Create a new TimeMap item with a map placemark and a timeline event
 *
 * @constructor
 * @param {placemark} placemark     The map placemark (one of GMarker, GPolyline, or GPolygon)
 * @param {Event} event             The timeline event
 * @param {TimeMapDataset} dataset  Reference to the parent dataset object
 * @param {Object} options          A container for optional arguments:
 *   {String} title                     Title of the item
 *   {String} description               Plain-text description of the item
 *   {String} type                      Type of map placemark used (marker. polyline, polygon)
 *   {GLatLng} infoPoint                Point indicating the center of this item
 *   {String} infoHtml                  Full HTML for the info window
 *   {String} infoUrl                   URL from which to retrieve full HTML for the info window
 *   {Function} openInfoWindow          Function redefining how info window opens
 *   {Function} closeInfoWindow         Function redefining how info window closes
 */
function TimeMapItem(placemark, event, dataset, options) {
    // initialize vars
    this.placemark = placemark;
    this.event =     event;
    this.dataset =   dataset;
    this.map =       dataset.timemap.map;
    
    // set defaults for options
    this.opts = options || {};
    this.opts.type =        options['type'] || '';
    this.opts.title =       options['title'] || '';
    this.opts.description = options['description'] || '';
    this.opts.infoPoint =   options['infoPoint'] || null;
    this.opts.infoHtml =    options['infoHtml'] || '';
    this.opts.infoUrl =     options['infoUrl'] || '';
    
    // get functions
    this.getType = function() { return this.opts.type; };
    this.getTitle = function() { return this.opts.title; };
    this.getInfoPoint = function() { return this.opts.infoPoint; };
    
    // allow for custom open/close functions, set at item, dataset, or timemap level
    this.openInfoWindow =   options['openInfoWindow'] ||
                            dataset.opts['openInfoWindow'] ||
                            dataset.timemap.opts['openInfoWindow'] ||
                            false;
    if (!this.openInfoWindow) {
        // load via AJAX if URL is provided
        if (this.opts.infoUrl != "")
            this.openInfoWindow = TimeMapItem.openInfoWindowAjax;
        // otherwise default to basic window
        else this.openInfoWindow = TimeMapItem.openInfoWindowBasic;    
    }
    this.closeInfoWindow = options['closeInfoWindow'] || TimeMapItem.closeInfoWindowBasic;
}

/*
 * Standard open info window function, using static text in map window
 */
TimeMapItem.openInfoWindowBasic = function() {
    // create content for info window if none is provided
    if (this.opts.infoHtml == "" && this.opts.infoUrl == "") {
        this.opts.infoHtml = '<div class="infotitle">' + this.opts.title + '</div>';
        if (this.opts.description != "") 
            this.opts.infoHtml += '<div class="infodescription">' + this.opts.description + '</div>';
    }
    // open window
    if (this.getType() == "marker") {
        this.placemark.openInfoWindowHtml(this.opts.infoHtml, {maxWidth: 400});
    } else if (this.placemark instanceof GOverlay) {
        this.map.openInfoWindowHtml(this.getInfoPoint(), this.opts.infoHtml);
    } else {
        this.map.openInfoWindowHtml(this.map.getCenter(), this.opts.infoHtml, {maxWidth: 400});
    }
}

/*
 * Open info window function using ajax-loaded text in map window
 */
TimeMapItem.openInfoWindowAjax = function() {
    if (this.opts.infoHtml != "") { // already loaded - change to static
        this.openInfoWindow = TimeMapItem.openInfoWindowBasic;
        this.openInfoWindow();
    } else { // load content via AJAX
        if (this.opts.infoUrl != "") {
            var item = this;
            GDownloadUrl(this.opts.infoUrl, function(result) {
                    item.opts.infoHtml = result;
                    item.openInfoWindow();
            });
        } else { // fall back on basic function
            this.openInfoWindow = TimeMapItem.openInfoWindowBasic;
            this.openInfoWindow();
        }
    }
}

/*
 * Standard close window function, using the map window
 */
TimeMapItem.closeInfoWindowBasic = function() {
    if (this.getType() == "marker") {
        this.placemark.closeInfoWindow();
    } else {
        var infoWindow = this.map.getInfoWindow();
        // close info window if its point is the same as this item's point
        if (infoWindow.getPoint() == this.getInfoPoint() 
            && !infoWindow.isHidden())
                this.map.closeInfoWindow();
    }
}

// convenience trim function
function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
