/*
 * @fileoverview Demonstrates how to load a shapefile and parse it using
 * JavaScript.
 * @author Mano Marks
 */

var map;
var dbf;
var shp;
var infowindow;

// Creates the map, loads in the SHP and DBF files.
function init() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: new google.maps.LatLng(39.3, -95.8),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'water',
        stylers: [{ color: '#c3cfdd'}]
      },
      {
        featureType: 'poi',
        stylers: [{visibility: 'off'}]
      }
    ]
  });

  SHPParser.load('tl_2010_06_tract10/tl_2010_06_tract10.shp', shpLoad,
    shpLoadError);
  DBFParser.load('tl_2010_06_tract10/tl_2010_06_tract10.dbf', dbfLoad,
    dbfLoadError);
}

// Handles the callback from loading DBFParser by assigning the dbf to a global.
function dbfLoad(db) {
  dbf = db;
  if (dbf && shp) {
    render();
  }
}

/* Handles the callback from loading the shp file.
 * @param {SHPParser} shp The results of parsing the shp file.
 */
function shpLoad(sh) {
  shp = sh;
  if (dbf && shp) {
    render();
  }
}

/**
 * Takes the geometries from the shp file and the data from the dbf file by
 * creating a polygon for each shp record with an InfoWindow and right panel
 * for the data from the dbf file.
 */
function render() {
  var points;
  var type;
  var ne = new google.maps.LatLng(shp.maxY, shp.maxX);
  var sw = new google.maps.LatLng(shp.minY, shp.minX);
  var bounds = new google.maps.LatLngBounds(sw, ne);
  map.fitBounds(bounds);
  for (var i = 0; i < shp.records.length; i++) {
    var shape = shp.records[i].shape;
    switch (shape.type) {
      case 1:
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(shape.content.y,shape.content.x),
          map: map
        });
      break;

      case 3:
        points = pathToMVCArray(shape.content.points);
      break;

      case 5:

      // split into rings
      var polygonPoints = new google.maps.MVCArray();
      var parts = shape.content.parts;
      if (parts.length === 1) {
        polygonPoints.push(pathToMVCArray(shape.content.points));
      } else {
        var j;
        for (j = 0; j < parts.length - 1; j++) {
          polygonPoints.push(pathToMVCArray(shape.content.points.subarray(
              2 * parts[j], 2 * parts[j + 1])));
          if (2 * parts[j + 1] > shape.content.points.length) {
            throw new Error('part index beyond points array end');
          }
        }
      }
      // create a polygon.
      var polygon = new google.maps.Polygon({
        strokeWeight: .3,
        fillOpacity: .2,
        paths: polygonPoints,
        map: map
      });
      polygon.tractId = i;

      // Create InfoWindow at click point and put data in side panel.
      google.maps.event.addListener(polygon, 'click', function(e) {
        if (typeof infowindow != 'undefined') {
          infowindow.close();
        }
        var htmlContent = recordHtmlContent(dbf.records[this.tractId]);
        infowindow = new google.maps.InfoWindow({
          content: htmlContent,
          position: e.latLng,
          map: map
        });
        document.getElementById('side').innerHTML = htmlContent;
      });
    }
  }
}

/* Create a nice presentation for the attribute data.
 * @param {object} record An object representing the individual record.
 */
function recordHtmlContent(record) {
  var content = '';
  for (var key in record) {
    content += '<b>' + key + '</b>: ' + record[key] + '<br>';
  }
  return content;
}

/* Create an MVCArray out of a set of points ordered longitude/latitude
 * @param {array} path an array of points.
 */
function pathToMVCArray(path) {
  var polygonPoints = new google.maps.MVCArray();
  for (var i = 0; i < path.length; i += 2) {
    polygonPoints.push(new google.maps.LatLng(path[i + 1], path[i]));
  }
  return polygonPoints;
}

// error handler for shploader.
function shpLoadError() {
  window.console.log('shp file failed to load');
}

// error handler for dbfloader.
function dbfLoadError() {
  console.log('dbf file failed to load');
}
document.addEventListener('DOMContentLoaded', init, false);
