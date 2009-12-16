/*
 * main.js
 * Main application code, which uses the SearchService to search a map of 4-year U.S.
 * colleges, and displays the results on both a map and table.
 *
 * Two types of searches are performed:
 *   doAddressSearch -- triggered when the 'Search' form is submitted.
 *     Geocodes the address, searches for the closest markers, finds bounds
 *     containing all results, and updates the map and results.
 *   doBoundsSearch -- triggered when the map bounds change (e.g. user drags or zooms).
 *     Searches for all markers within the current map bounds, and displays them.
 *
 *
 * Copyright (c) 2009, Google Inc. All Rights Reserved
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
 * @author Matt Holden
 */

/* Constants */

// ID of the map over which to search: this can be taken from the Maps Data API maps
// meta-feed, or extracted from a map's 'Link' in the Google My Maps UI.
var MAP_ID = '106502860966716127538.00047aa72348d4e75dff1';

// Since the map has thousands of results, we'll only show search results above a certain zoom.
var RESULTS_MIN_ZOOM_LEVEL = 8;

// Max number of search results to display.
var MAX_RESULTS = 30;


/* Global variables */

var g_map = null;             // google.maps.Map object that renders the map.
var g_searchService = null;   // SearchService object that handles the Maps Data API calls.
var g_markers = null;         // Array of Markers currently on the map.
var g_markersById = {};     // Mapping from feature ids to markers.
var g_infowindow = null;      // The current open infowindow, if any.


/* Initialization */

google.load('gdata', '2.x', {'packages': ['maps']});
google.load("maps", "3",  {other_params: "sensor=false", region: "US"});
google.setOnLoadCallback(initialize);

function $(id) {
  return document.getElementById(id);
}

/**
 * Sets up the Map and SearchService objects, and adds event handlers to trigger searches.
 */
function initialize() {
  g_searchService = new google.code.mapsearch.SearchService('com.google.code.College-Finder-Demo');
  
  g_map = new google.maps.Map($("map"), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(37.0625,-95.677068),
    zoom: 4
    });
  
  google.maps.event.addListener(g_map, 'click', closeInfowindow);
  
  // Update the search in the current bounds whenever a filter changes.
  $('select_size').onchange = doBoundsSearch;
  $('cb_public').onchange = doBoundsSearch;
  $('cb_private').onchange = doBoundsSearch;
  
  // Perform a new geocode search when the radius changes.
  $('select_radius').onchange = doAddressSearch;
  
  // Search within the bounds whenever the map is dragged or zoomed.
  google.maps.event.addListener(g_map, 'dragstart', function() {
      this.dragging = true;
    });
  google.maps.event.addListener(g_map, 'dragend',   function() {
      this.dragging = false;
      doBoundsSearch();
    });
  google.maps.event.addListener(g_map, 'bounds_changed', function() {
      if (! this.dragging) {
        doBoundsSearch();
      }
    });
}


/* Make search requests */

/**
 * Do a geocode search when the user enters an address or city and clicks 'Search'.
 * The address is geocoded, and we search for the 10 closest results ordered by distance.
 * The callback function finds bounds containing the results, and displays them.
 */
function doAddressSearch() {
  var address = $("search_input").value;
  var radius = $("select_radius").value;
  
  g_searchService.search({
    address: address,
    radius: radius,
    filters: getFilters(),
    maxResults: MAX_RESULTS,
    sortBy: 'distance',
    mapId: MAP_ID,
  }, showAddressSearchResults);
  
}

/**
 * Do a search based on the map bounds (e.g. after a pan or zoom), and update the results.
 */
function doBoundsSearch() {
  // Don't show any results at low zooms, since there are so many.
  if (g_map.getZoom() < RESULTS_MIN_ZOOM_LEVEL) {
    clearMap();
    return;
  }
  
  g_searchService.search({
    latLng: g_map.getCenter(),
    bounds: g_map.getBounds(),
    filters: getFilters(),
    maxResults: MAX_RESULTS,
    sortBy: 'distance',
    mapId: MAP_ID,
  }, showResults);
}

/**
 * Return the array of attribute filters based on checkbox states.
 */
function getFilters() {
  
  // Should we show public and/or private schools?
  var showPublic = $('cb_public').checked;
  var showPrivate = $('cb_private').checked;
  var type = null;
  if (showPublic && showPrivate) {
    type = 'Both';
  } else if (showPublic) {
    type = 'Public';
  } else if (showPrivate) {
    type = 'Private';
  } else {
    type = 'None';
  }
  
  // Should we filter by student body size?
  var size = $("select_size").value;
  
  // Create the corresponding attribute filters.
  var filters = new Array();
  if (type != 'Both') {
    filters.push('[Type:' + type + ']');
  }
  if (size != 'Any size') {
    filters.push('[Size:' + size + ']');
  }

  return filters;
}


/* Display search results */

/**
 * For geocode searches, set the map to the smallest bounds containing the search results.
 */
function showAddressSearchResults(results) {
  var bounds = new google.maps.LatLngBounds();
  for (var i in results) {
    bounds.extend(results[i].marker.getPosition());
  }
  g_map.fitBounds(bounds);   // The bounds change triggers doBoundsSearch
}

/**
 * Display search results on the map and in the results table.
 */
function showResults(results) {
  // Close any open IW, since the results may have changed.
  closeInfowindow();
  
  // We could easily clear the map and then add the new markers, but this would
  // cause some markers to flicker when they are removed/added.  So instead, we add markers
  // for new results, and remove markers that are no longer in the results.
  
  // Get the new array of markers, either reusing existing ones or creating new ones.
  var newMarkers = new Array(results.length);
  var newMarkersById = {};
  for (var i in results) {
    var marker;
    
    var id = results[i].id;
    if (id in g_markersById) {
      // This result is already on the map, so use the existing marker.
      marker = g_markersById[id];
    } else {
      // Create a marker for this new result.
      marker = results[i].marker;
      marker.setMap(g_map);
      google.maps.event.addListener(marker, "click",
        getMarkerClickHandler(marker, results[i].title, results[i]['ExtendedData'])
      );
    }
    newMarkers[i] = marker;
    newMarkersById[id] = marker;
  }
  
  // Remove any markers that are no longer in the results.
  for (var id in g_markersById) {
    if (!newMarkersById[id]) {
      g_markersById[id].setMap(null);
    }
  }
  
  g_markers = newMarkers;
  g_markersById = newMarkersById;

  listResultsInTable(results);
}

/**
 * Return the event handler to call when a marker gets clicked.
 */
function getMarkerClickHandler(marker, title, extendedData) {
  return function() {
    // Close one infowindow before opening another.
    closeInfowindow();
    
    var schoolType = extendedData['Type'] + ' school with ' + extendedData['Size'] + ' students';
    var website = extendedData['Website'];
    var description = '<div class="address">' + extendedData['Address'] + '</div>'
                    + '<div class="type">' + schoolType + '</div>';
    if (website) {
      description += '<a target="_blank" href="http://' + website + '">' + website + '</a>';
    }
    
    var content = '<div class="infowindow">' +
                    '<div class="title">' + title + '</div>' +
                    '<div class="description">' + description + '</div>' +
                  '</div>';
    
    g_infowindow = new google.maps.InfoWindow({
      'content': content,
      'disableAutoPan': true    // otherwise, the autopan will trigger a new search
      });
    g_infowindow.open(g_map, marker);
  }
}

/**
 * Display the results in a table below the map.
 */
function listResultsInTable(results) {
  var html = '';
  for (var i = 0; i < results.length; i++) {
    html += '<div onclick="showResult(' + i + ')" class="result" id="result_' + i + '">';
    html += '  <div>';
    html += results[i].title;
    html += '  </div>';
    html += '</div>';
  }
  
  $('results_container').innerHTML = html;
}

/**
 * Trigger a marker click to show the infowindow when the corresponding table
 * row is clicked.
 */
function showResult(i) {
  if (g_markers[i] != null) {
    google.maps.event.trigger(g_markers[i], "click");
  }
}

/**
 * Close the infowindow if it's open.
 */
function closeInfowindow() {
  if (g_infowindow) {
    g_infowindow.close();
  }
}

/**
 * Clear the results from both the map and the results table.
 */
function clearMap() {
  for (i in g_markers) {
    g_markers[i].setMap(null);
  }
  $('results_container').innerHTML = '';
}

function errorHandler(e) {
  alert('Error: ' + (e.cause ? e.cause.statusText : e.message));
}