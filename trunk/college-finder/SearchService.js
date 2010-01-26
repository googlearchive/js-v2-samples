/*
 * SearchService.js
 * This class is responsible for making search requests to the Maps Data API
 * and returning the results.
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
 * @author Thor Mitchell
 * @author Matt Holden
 */

if (! window.google) {
  window.google = {};
}
if (! google.code) {
  google.code = {};
}
google.code.mapsearch = {};
google.code.mapsearch.COMMON_LOADER_URI_ = 'http://www.google.com/jsapi';
google.code.mapsearch.MAPS_FEEDS_URI_ = 'http://maps.google.com/maps/feeds';

/**
 * Class that provides the search functionality and parses the results
 * into an easy to use array. Modeled on the Maps API v3 Geocoder class.
 * @constructor
 * @param application_name {String} A string identifier for your application.
 */
google.code.mapsearch.SearchService = function(application_name) {
  // Check that required dependencies are already loaded
  if (! google.maps || ! google.maps.Geocoder) {
    throw new Error('Maps API v3 must be loaded prior to creating SearchService.');
  }
  else if (! google.gdata || ! google.gdata.maps) {
    throw new Error('Maps Data API must be loaded prior to creating SearchService.');
  }
  
  this.parser_ = new DOMParser();
  this.geocoder_ = new google.maps.Geocoder();
  this.mapsService_ = new google.gdata.maps.MapsService(application_name);
  
  this.defaultMaxResults_ = 10;
  this.radius_re_ = /^(\d+)[ ]?(m|km|miles)$/
}

/**
 * Take a SearchRequest object literal, specifying a spatial and/or attribute
 * search on a single map, and return the search results as an Array.
 *
 * request {Object} SearchRequest literal containing the search options.
 *   Valid options are:
 *   <ul>
 *   <li>latLng {google.maps.LatLng}: A location around which to search.  When a
 *       radius is specified, the search returns placemarks within the radius of
 *       this location.  The 
  option can also indicate search results should
 *       be sorted by distance to this location.  If an address and latLng are both
 *       supplied, the latLng takes precedence.
 *   <li>address {string}: A text address that is geocoded to a latLng prior to searching.
 *   <li>bounds {google.maps.LatLngBounds}: A geographical bounding box to search
 *       within. If this option is supplied it takes precedence over address and
 *       latLng for results filtering, but results can still be sorted by distance
 *       to a location.
 *   <li>radius {string}: A distance specified as '<number> <units>' representing
 *       the distance from the specified address or latLng to search. Valid
 *       values for <units> are 'm', 'km', or 'miles'. This parameter only applies
 *       if an address or latLng option was supplied.
 *   <li>mapId {string}: The map ID of the map over which to search.  This ID can be
 *       found in two ways: in the Maps Data API map feed or in the 'Link' URL for the
 *       map in the Google My Maps interface at http://maps.google.com/maps/mm.
 *   <li>filters {Array string}: An array of attribute filter expressions of the form
 *       '[name: value]' (for example, '[has_wireless: true]).
 *   <li>maxResults {number}: Maximum numbers of results to return (defaults to 10).
 *   <li>sortBy {string}: The only option currently supported is sortBy 'distance',
 *       which sorts locations by their proximity to the address or latLng location.
 *   <li>startIndex {string}: Index in the full list of results of the first
 *        result to include in the response. Used for paging results.
 *   </ul>
 * @param callback {Function} Reference to function that will be called with an array of
 *   results when the search returns.
 */
google.code.mapsearch.SearchService.prototype.search = function(request, callback) {
  if (request.address) {
    this.geocoder_.geocode({ address: request.address }, this.handleGeocodeResponse_(request, callback));
  } else {
    this.parseRequest_(request, callback);
  }
}

/**
 * Extract the lat/lng from the geocoder response before parsing the search request.
 * @private
 */
google.code.mapsearch.SearchService.prototype.handleGeocodeResponse_ = function(request, callback) {
  var me = this;
  return function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      request.latLng = results[0].geometry.location;
      me.parseRequest_(request, callback);
    } else {
      alert("Sorry, we couldn't find a location matching " + request.address);
    }
  }
}

/**
 * Parse the arguments of a search request object to create the corresponding
 * feature feed search URL for the Maps Data API.  Request the search results
 * using the given callback.
 * @private
 */
google.code.mapsearch.SearchService.prototype.parseRequest_ = function(request, callback) {
  var me = this;
  
  var featureFeedUrl = google.code.mapsearch.MAPS_FEEDS_URI_ + '/features';
  var params = [];
  
  if (request.mapId) {
    featureFeedUrl += '/' + request.mapId + '/full?';
  } else {
    throw new Error('mapId is required');
  }
  
  /* A latLng option will override an address option if both are provided */
  if (request.latLng) {
    params.push('lat=' + this.roundCoord_(request.latLng.lat()));
    params.push('lng=' + this.roundCoord_(request.latLng.lng()));
  }
  
  /* This precedes checking for bounds because it is not permitted
   * to set a radius on a bounds filter.
   */
  if (request.radius) {
    var radius_units = this.radius_re_.exec(request.radius);
    if (radius_units == null) {
      throw new Error("Search radius must be a number followed by a unit (m, km, or miles).");
    }
    
    var radius = radius_units[1];
    var units = radius_units[2];
    
    // Convert radius to meters.
    if (units == 'km') {
      radius *= 1000;
    } else if (units == 'miles') {
      radius *= 1609.344;
    }
    params.push('radius=' + radius);
  }
  
  if (request.bounds) {
    var sw = request.bounds.getSouthWest()
    var ne = request.bounds.getNorthEast();
    params.push('box=' +
                this.roundCoord_(sw.lng()) + ',' +
                this.roundCoord_(sw.lat()) + ',' +
                this.roundCoord_(ne.lng()) + ',' +
                this.roundCoord_(ne.lat()));
  }

  // Attribute filters can be provided either with or without enclosing square brackets.
  if (request.filters) {
    var mq = '';
    for (var i = 0; i < request.filters.length; i++) {
      var filter = request.filters[i];
      if (filter.indexOf('[') == 0 && filter.lastIndexOf(']') == (filter.length - 1)) {
        mq += filter;
      } else {
        mq += '[' + filter + ']';
      }
    }
    params.push('mq=' + mq);
  }
  
  if (request.sortBy) {
    params.push('sortby=' + request.sortBy);
  }
  
  if (request.maxResults) {
    params.push('max-results=' + request.maxResults);
  } else {
    params.push('max-results=' + this.defaultMaxResults_);
  }
  
  if (request.startIndex) {
    params.push('start-index=' + request.maxResults);
  }
  
  featureFeedUrl += params.join('&');
  
  this.mapsService_.getFeatureFeed(featureFeedUrl, function(feedRoot) {
    me.returnResults_(feedRoot.feed.getEntries(), callback);
  });
}

/**
 * Converts an array of google.gdata.maps.FeatureEntry objects into an
 * easy to use Array of typed results and returns it to the application via the
 * callback given to SearchService().
 *
 * @param entries {Array google.gdata.maps.FeatureEntry} The results of the Maps GData API search.
 * @param callback {Function} Reference to function that will be called with the parsed results.
 * @private
 */
google.code.mapsearch.SearchService.prototype.returnResults_ = function(entries, callback) {
  var results = new Array(entries.length);
  for (var i in entries) {
    var kmlString = entries[i].getContent().getText();
    var kml = this.parser_.parseFromString(kmlString, 'text/xml');
    var placemark = this.getTags_(kml, 'Placemark').item(0);
    
    // Get standard Atom properties.
    results[i] = {};
    results[i]['id']        = entries[i].getId().getValue();
    results[i]['published'] = entries[i].getPublished().getValue().getDate();
    results[i]['updated']   = entries[i].getUpdated().getValue().getDate();
    results[i]['title']     = entries[i].getTitle().getText();
    results[i]['name']        = this.getFirstTagContent_(placemark, 'name');
    results[i]['description'] = this.getFirstTagContent_(placemark, 'description');
    
    // Get any GData custom properties
    results[i]['properties'] = this.getCustomProperties_(entries[i]);
    
    // Get any KML ExtendedData elements.
    results[i]['ExtendedData'] = this.getExtendedData_(placemark);
    
    // Construct a google.maps.Marker from the parsed KML Placemark.
    results[i]['marker'] = this.getMarker_(placemark);
  }
  callback(results);
}

/**
 * Return all tags of the give type in an XML DOM node.
 * @private
 */
google.code.mapsearch.SearchService.prototype.getTags_ = function(node, tag) {
  return node.getElementsByTagNameNS('http://www.opengis.net/kml/2.2', tag);
}

/**
 * Return the contents of first tag of the given type within an XML DOM node.
 * @private
 */
google.code.mapsearch.SearchService.prototype.getFirstTagContent_ = function(node, tag) {
  var tags = this.getTags_(node, tag);
  if (tags.length > 0 && tags.item(0).childNodes.length > 0) {
    return tags.item(0).childNodes[0].nodeValue;
  } else {
    return null;
  }
}

/**
 * Construct a Google Maps API Marker object from a Google Data API search result.
 *
 * @param entry  {google.gdata.maps.FeatureEntry} A Maps Data API feature search result.
 * @return {google.maps.Marker}
 * @private
 */
google.code.mapsearch.SearchService.prototype.getMarker_ = function(placemark) {
  var coords = this.getFirstTagContent_(placemark, 'coordinates').split(',');
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(coords[1], coords[0]),
    title: name,
  });
  
  var iconNode = this.getTags_(placemark, 'Icon').item(0);
  if (iconNode) {
    var iconHref = this.getFirstTagContent_(iconNode, 'href');
    marker.setIcon(iconHref);
  }

  return marker;
}

/**
 * Extract any ExtendedData name/value pairs from the given Placemark element,
 * and return them as a dictionary.
 * @private
 */
google.code.mapsearch.SearchService.prototype.getExtendedData_ = function(placemark) {
  var extData = {}
  var extDataTags = this.getTags_(placemark, 'ExtendedData');
  if (extDataTags) {
    var dataTags = this.getTags_(extDataTags[0], 'Data');
    for (var i=0; i < dataTags.length; i++) {
      var name = dataTags[i].getAttribute('name');
      var value = this.getFirstTagContent_(dataTags[i], 'value');
      extData[name] = value;
    }
  }
  return extData;
}

/**
 * Return the GData CustomProperties for a feature, as a dictionary of name/value pairs.
 * @param featureEntry {google.gdata.maps.FeatureEntry}
 */
google.code.mapsearch.SearchService.prototype.getCustomProperties_ = function(featureEntry) {
  var properties = featureEntry.getCustomProperties();
  var results = {};
  for (var j=0; j < properties.length; j++) {
    var name  = properties[j].getName();
    var value = properties[j].getValue();
//    var type  = properties[j].getType();
//    var unit  = properties[j].getUnit();
    if (! results[name]) {
      results[name] = [];
    }
    results[name].push(value);
  }
  return results;
}

/**
 * Round a decimal coordinate to 6 decimal places.
 *
 * @param coord {Number}
 * @returns {Number}
 * @private
 */
google.code.mapsearch.SearchService.prototype.roundCoord_ = function(coord) {
  return (Math.round(coord * 1000000) / 1000000)
}