{
var afsMode = true;
var afsLoadRequested = false;
function LocalSearch(opt_options) {

  // inline ads
  this.inlineAds = null;
  if (document.getElementById("_gmls_inline_ads_div_")) {
    if (afsMode && afsLoadRequested == false) {
      // defer load afs, now it can safely access the named div from
      // above...
      afsLoadRequested = true;
      var scriptUrl = "http://www.google.com/afsonline/show_dynamic_afs_ads.js";
      setTimeout(methodClosure(this, loadAfs, [scriptUrl]), 0);
    }
    this.inlineAds = new InlineAds();
    if (this.inlineAds.adDiv == null) {
      this.inlineAds = null;
    }
  }
  this.options = opt_options;
}
LocalSearch.RESULT_LIST_INLINE = "inline";
LocalSearch.RESULT_LIST_SUPPRESS = "suppress";

// Export as google.maps.LocalSearch()
if (!google) {
  var google = {};
}
if (!google.maps) {
  google.maps = {};
}
google.maps.LocalSearch = LocalSearch;

LocalSearch.prototype = new GControl(false,true);
LocalSearch.prototype.initialize = function(map) {

  this.gmap = map;
  this.parseOptions(this.options);

  var container = document.createElement("div");
  cssSetClass(container, css.control_root);
  this.buildControl(container);


  map.getContainer().appendChild(container);
  if (this.inlineAds && this.inlineAds.facts.parent == "map") {
    map.getContainer().appendChild(this.inlineAds.root);
  }
  return container;
}

LocalSearch.prototype.getDefaultPosition = function() {
  var x = 5;
  var y = 65;
  if (br_IsIE()) {
    x = 2;
  }
  return new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(y,x));
}

LocalSearch.prototype.parseOptions = function(options) {
  this.inlineResultList = true;
  this.externalResultListContainer = null;
  this.externalAds = null;
  this.linkTarget = GSearch.LINK_TARGET_BLANK;
  this.addressLookupMode = GlocalSearch.ADDRESS_LOOKUP_ENABLED;
  this.searchFormHint = GSearch.strings["search-the-map"];
  this.onIdleCallback = null;
  this.onSearchCompleteCallback = null;
  if (options) {

    // external ads
    if (options.externalAds) {
      this.externalAds = new ExternalAds(options.externalAds);
    }

    // address lookup mode
    if (options.addressLookupMode) {
      this.addressLookupMode = options.addressLookupMode;
    }

    // result list style
    if (options.resultList) {
      if (options.resultList == LocalSearch.RESULT_LIST_INLINE) {
        this.inlineResultList = true;
      } else if (options.resultList == LocalSearch.RESULT_LIST_SUPPRESS) {
        this.inlineResultList = false;
      } else {
        this.inlineResultList = true;
        this.externalResultListContainer = options.resultList;
      }
    }

    // linkTarget
    if (options.linkTarget) {
      this.linkTarget = options.linkTarget;
    }

    // search form hint string
    if (options.searchFormHint) {
      this.searchFormHint = options.searchFormHint;
    }

    // callbacks
    if (options.onIdleCallback) {
      this.onIdleCallback = options.onIdleCallback;
    }

    // callbacks
    if (options.onSearchCompleteCallback) {
      this.onSearchCompleteCallback = options.onSearchCompleteCallback;
    }
  }

  // adjust css.app, .app_active, .app_idle, and .app_no_results to account
  // for cull or compact mode
  var browserAdd = "gmls-std-mode";
  if (br_IsIE()) {
    browserAdd = "gmls-ie-mode";
  }
  var classAddOn = " " + css.app_compact_mode + " " + browserAdd;
  if (this.inlineResultList == true) {
    classAddOn = " " + css.app_full_mode + " " + browserAdd;;
  }
  css.app += classAddOn;
  css.app_active += classAddOn;
  css.app_idle += classAddOn;
  css.app_no_results += classAddOn;
}

LocalSearch.prototype.buildControl = function(container, opt_options) {
  this.root = container;

  this.buildContainerGuts(opt_options);

  // result scroller
  this.currentResultIndex = 0;
  this.markers = new Array();
  this.idle = true;

  // bind up the controls
  this.searchForm.input.onclick = methodClosure(this, LocalSearch.prototype.onPreActive, []);
  this.searchForm.input.onfocus = methodClosure(this, LocalSearch.prototype.onPreActive, []);
  this.searchForm.setOnSubmitCallback(this,LocalSearch.prototype.formSubmit);

  this.next.onclick = methodClosure(this, LocalSearch.prototype.onNext, []);
  this.prev.onclick = methodClosure(this, LocalSearch.prototype.onPrev, []);

  // build the icons
  var baseIcon = new GIcon();
  baseIcon.image = "http://www.google.com/mapfiles/gadget/markerSmall80.png";
  baseIcon.shadow = "http://www.google.com/mapfiles/gadget/shadow50Small80.png";
  baseIcon.iconSize = new GSize(16, 27);
  baseIcon.shadowSize = new GSize(30, 28);
  baseIcon.iconAnchor = new GPoint(8, 27);
  baseIcon.infoWindowAnchor = new GPoint(5, 1);
  this.letteredIcons = new Array();
  for ( var i=0; i < 16; i++ ) {
    var icon = new GIcon(baseIcon);
    var iconImageKey =
    icon.image = "http://www.google.com/mapfiles/gadget/letters/marker" +
                      String.fromCharCode(65+i) + ".png";
    this.letteredIcons[i] = icon;
  }

  if (opt_options) {
    if (opt_options.linkTarget) {
      this.linkTarget = opt_options.linkTarget;
    }
  }
  this.bootComplete(null);
}

LocalSearch.prototype.buildContainerGuts = function(opt_options) {

  // build out the control including the form and results popup
  removeChildren(this.root);
  this.appContainer = createDiv(null, css.app);

  // create a container for the ads to sit in. this is their
  // permanent home in the dom
  if (this.inlineAds) {
    this.inlineAds.root = createDiv(null, css.ads[this.inlineAds.facts.format]);
    this.inlineAds.root.appendChild(this.inlineAds.adDiv);
  }

  // the search form
  this.searchFormDiv = createDiv(null, css.search_form_idle);
  this.searchForm = new GSearchForm(false, this.searchFormDiv);
  // todo(markl):
  // this really needs a home, maybe in the search form user cell
  this.attributionDiv = createDiv(null, css.attribution);

  this.buildPrevNextControl();

  /**
   * This is the basic structure we are building
   *  <resultsPopup>
   *    <resultsList>
   *      <resultsTable/>
   *      <adsBox/>?
   *      <resultsControls/>
   *      <attributionDiv/>
   *    </resultsList>
   *  </resultsPopup>
   */
  this.resultsPopup = createDiv(null, css.results_popup);
  this.resultsList = createDiv(null, css.results_list);
  this.resultsTableDiv = createDiv(null, css.results_table);
  this.resultsTable = createTable(css.results_table);
  this.resultsTableDiv.appendChild(this.resultsTable);

  var adsBox = null;
  if (this.inlineAds && this.inlineAds.facts.parent == "results") {
    adsBox = createDiv(null,css.results_ads_box);
    adsBox.appendChild(this.inlineAds.root);
  }
  this.resultControls = createDiv(null, css.results_controls);

  // bind everything up
  this.resultsPopup.appendChild(this.resultsList);
  this.resultsList.appendChild(this.resultsTableDiv);
  if (adsBox) {
    this.resultsList.appendChild(adsBox);
  }
  this.resultsList.appendChild(this.resultControls);

  this.resultsList.appendChild(this.attributionDiv);

  // IF we have an external ResultListContainer,
  // attach the resultsPopup there, otherwise
  // attach in the appContainer
  if (this.externalResultListContainer) {
    removeChildren(this.externalResultListContainer);
    var appContainer = createDiv(null, css.app);
    appContainer.appendChild(this.resultsPopup);
    this.externalResultListContainer.appendChild(appContainer);
    this.externalResultListContainer = appContainer;
  } else {
    this.appContainer.appendChild(this.resultsPopup);
  }

  this.appContainer.appendChild(this.searchFormDiv);
  this.root.appendChild(this.appContainer);
}

LocalSearch.prototype.resetResultsTable = function() {
  this.resultsTableDiv.innerHTML = "";
  this.resultsTable = createTable(css.results_table);
  this.resultsTableDiv.appendChild(this.resultsTable);
}

LocalSearch.prototype.buildPrevNextControl = function() {
  // controls
  this.prevNext = createDiv(null, css.prev_next_active);
  this.prev = createDiv(null, css.prev);
  this.next = createDiv(null, css.next);

  this.prev.innerHTML = "&nbsp;";
  this.next.innerHTML = "&nbsp;";
  this.prev.title = GSearch.strings["previous"];
  this.next.title = GSearch.strings["next"];

  var prevNextCenter = createDiv(null, css.prev_next_center);
  prevNextCenter.appendChild(this.prev);
  prevNextCenter.appendChild(this.next);

  this.prevNext.appendChild(prevNextCenter);
}

LocalSearch.prototype.bootComplete = function() {
  // create a searcher and bind to the map
  this.gs = new GlocalSearch();
  this.gs.setResultSetSize(GSearch.LARGE_RESULTSET);
  this.gs.setLinkTarget(this.linkTarget);
  this.gs.setCenterPoint(this.gmap);
  this.gs.setAddressLookupMode(this.addressLookupMode);
  if (this.adsenseList) {
    for (var i=0; i<this.adsenseList.length; i++) {
      this.gs.addRelatedSearcher(this.adsenseList[i]);
    }
  }
  this.gs.setSearchCompleteCallback(this, LocalSearch.prototype.searchComplete, [null]);
  GEvent.bind(this.gmap, "click", this, this.onMapClick);
  this.goIdle();
}

// clear the old markers off of the map
LocalSearch.prototype.clearMarkers = function() {
  cssSetClass(this.prevNext, css.prev_next_idle);

  this.gmap.closeInfoWindow();
  for (var i=0; i < this.markers.length; i++) {
    this.gmap.removeOverlay(this.markers[i].marker);
    if ( this.markers[i].resultsListItem &&
         this.markers[i].resultsListItem.onclick ) {
      this.markers[i].resultsListItem.onclick = null;
    }
    this.markers[i].resultsListItem = null;
  }
  this.resetResultsTable();

  // result scroller
  this.currentResultIndex = 0;
  this.markers = new Array();
}

// drop the new markers on the map
LocalSearch.prototype.setMarkers = function() {
  // result scroller
  this.currentResultIndex = 0;
  this.markers = new Array();
  var bestResultUrl = null;
  this.resetResultsTable();

  if ( this.gs.results && this.gs.results.length > 0) {
    for (var i = 0; i < this.gs.results.length && i < 16; i++) {
      var result = this.gs.results[i];
      var icon = this.letteredIcons[i];
      this.markers.push(new LocalResult(this, result, icon, i,
                                        this.inlineResultList));

      // find the first, non-address result and hold on to it for the more-link
      if (bestResultUrl == null && !result.addressLookupResult ) {
        bestResultUrl = result.url;
      }
    }
    if (bestResultUrl == null) {
      bestResultUrl = this.gs.results[0].url;
    }

    this.idle = false;
    //this.selectMarker(0);

    this.addResultsControl(bestResultUrl);

    cssSetClass(this.prevNext, css.prev_next_active);
    this.setAppContainerClass(css.app_active);
    return true;
  } else {
    this.showNoResultsMessage();
    this.setAppContainerClass(css.app_active);
    return false;
  }
}

LocalSearch.prototype.addResultsControl = function(bestResultUrl) {
  removeChildren(this.resultControls);

  // NOW, take the URL and nuke from &latlnt.*&near ->&near
  var newUrl = bestResultUrl.replace(/&latlng=.*&near/,"&near");
  var moreDiv = createDiv(null, css.more_results);
  var alink = createLink(newUrl, GSearch.strings["more-results"],
                         this.linkTarget, css.more_results);
  moreDiv.appendChild(alink);

  var clearDiv = createDiv(GSearch.strings["clear-results-uc"],
                           css.clear_results);
  clearDiv.onclick = methodClosure(this,
                                      LocalSearch.prototype.goIdle,
                                      []);
  // create a table for these to sit within
  var prevNextTable = createTable(css.results_controls);
  var row = createTableRow(prevNextTable);
  var moreTd = createTableCell(row, css.more_results);
  var prevNextTd = createTableCell(row, css.prev_next);
  var clearTd = createTableCell(row, css.clear_results);

  moreTd.appendChild(moreDiv);
  prevNextTd.appendChild(this.prevNext);
  clearTd.appendChild(clearDiv);

  this.resultControls.appendChild(prevNextTable);
}

LocalSearch.prototype.showNoResultsMessage = function() {

  //todo(markl): Localize "No Results" text
  var row = createTableRow(this.resultsTable);
  var tdiv = createDiv("No Results", css.result_list_item_warning_text);
  var resultTd = createTableCell(row, null);
  var resultDiv = createDiv(null, css.result_list_item);
  var key = createDiv("!", css.result_list_item_warning_symbol);
  resultDiv.appendChild(key);
  resultDiv.appendChild(tdiv);
  resultTd.appendChild(resultDiv);

  removeChildren(this.resultControls);
  var moreDiv = createDiv("", css.more_results);
  var clearDiv = createDiv(GSearch.strings["close"],
                           css.clear_results);
  clearDiv.onclick = methodClosure(this,
                                      LocalSearch.prototype.goIdle,
                                      []);
  // create a table for these to sit within
  var prevNextTable = createTable(css.results_controls);
  var row = createTableRow(prevNextTable);
  var moreTd = createTableCell(row, css.more_results);
  var prevNextTd = createTableCell(row, css.prev_next);
  var clearTd = createTableCell(row, css.clear_results);

  moreTd.appendChild(moreDiv);
  prevNextTd.appendChild(this.prevNext);
  clearTd.appendChild(clearDiv);

  this.resultControls.appendChild(prevNextTable);
}

// light up the selected marker
LocalSearch.prototype.selectMarker = function(index) {

  // clear info window and reset icon on current marker
  this.gmap.closeInfoWindow();

  // if we have a results list, clear selected
  if (this.markers[this.currentResultIndex].resultsListItem) {
    cssSetClass(this.markers[this.currentResultIndex].resultsListItem,
                css.result_list_item);
  }

  // snap to current
  this.currentResultIndex = index;

  // light up current
  var result = this.markers[this.currentResultIndex];

  if (result.resultsListItem) {
    cssSetClass(result.resultsListItem, css.result_list_item_selected);
  }

  result.marker.openInfoWindow(result.getHtml(), {maxWidth:300});

  // set scroller
  if (index == 0) {
    cssSetClass(this.prev, css.prev_idle);
  } else {
    cssSetClass(this.prev, css.prev_active);
  }

  if (index == this.markers.length - 1) {
    cssSetClass(this.next, css.next_idle);
  } else {
    cssSetClass(this.next, css.next_active);
  }
}

// clear current markers and start a new search
LocalSearch.prototype.formSubmit = function(form) {
  if (form.input.value) {
    this.newSearch(form.input.value);
  }
  return false;
}

// clear current markers and start a new search
LocalSearch.prototype.execute = function(opt_query) {
  // hyperlink friendly...
  this.newSearch(opt_query);
}

LocalSearch.prototype.newSearch = function(opt_query) {
  this.setAppContainerClass(css.app_idle);
  if (opt_query) {
    this.searchForm.input.value  = opt_query;
  }
  if (this.searchForm.input.value) {

    // clear markers, set prev/next
    this.clearMarkers();
    removeChildren(this.attributionDiv);
    this.gs.execute(this.searchForm.input.value);
  }
  return false;
}

LocalSearch.prototype.searchComplete = function() {
  var attribution = this.gs.getAttribution();
  if (attribution) {
    this.attributionDiv.appendChild(attribution);
  }

  if (this.inlineAds) {
    this.inlineAds.hide();
  }
  if (this.externalAds) {
    this.externalAds.hide();
  }
  if (this.onSearchCompleteCallback) {
    this.onSearchCompleteCallback(this.gs);
  }
  if (this.setMarkers()) {
    // don't show ads for address lookup results
    if (this.gs.results && this.gs.results.length > 0 &&
        this.gs.results[0].addressLookupResult) {
      return;
    }
    if (this.inlineAds) {
      this.inlineAds.fetch(this.searchForm.input.value, this.gs.results);
      this.inlineAds.show();
    }
    if (this.externalAds) {
      this.externalAds.fetch(this.searchForm.input.value, this.gs.results);
      this.externalAds.show();
    }
  }
}

// forwards through the search results
LocalSearch.prototype.onNext = function() {
  if (this.currentResultIndex < this.markers.length - 1) {
    this.selectMarker(this.currentResultIndex+1);
  }
}

// backwards through the search results
LocalSearch.prototype.onPrev = function() {
  if (this.currentResultIndex > 0) {
    this.selectMarker(this.currentResultIndex-1);
  }
}

// called onboot complete, and on cancel click
LocalSearch.prototype.goIdle = function() {
  if (this.inlineAds) {
    this.inlineAds.hide();
  }
  if (this.externalAds) {
    this.externalAds.hide();
  }
  this.searchForm.input.value = this.searchFormHint;
  this.clearMarkers();
  cssSetClass(this.searchFormDiv, css.search_form_idle);
  this.setAppContainerClass(css.app_idle);
  cssSetClass(this.prevNext, css.prev_next_idle);

  this.idle = true;
  this.resetResultsTable();

  if (this.onIdleCallback) {
    this.onIdleCallback();
  }
}

// call onfocus/onclick for search input cell
LocalSearch.prototype.onPreActive = function() {
  if (this.idle) {
    this.searchForm.input.value = "";
    cssSetClass(this.searchFormDiv, css.search_form_active);
  }
}

LocalSearch.prototype.onMapClick = function(marker, point) {
  if (marker && marker.__ls__) {
    var localResult = marker.__ls__;
    localResult.onClick();
  }
}

LocalSearch.prototype.setAppContainerClass = function(className) {
  cssSetClass(this.appContainer, className);
  if (this.externalResultListContainer) {
    className += " " + css.app_external_results;
    cssSetClass(this.externalResultListContainer, className);
  }
}

// A class representing a single Local Search result returned by the
// Google AJAX Search API.
function LocalResult(gmls, result, icon, index, buildList) {
  this.gmls = gmls;
  this.result = result;
  this.latLng = new GLatLng(parseFloat(result.lat), parseFloat(result.lng));
  this.index = index;

  this.setMarker(icon);

  if (buildList) {
    var div = createDiv(null, css.result_list_item);
    var row = createTableRow(gmls.resultsTable);
    var tdiv = createDiv(result.title, css.gs_title);
    var resultTd = createTableCell(row, null);

    var resultDiv = createDiv(null, css.result_list_item);

    var key;
    var keyClass = css.result_list_item_key;
    var keyCode = String.fromCharCode(65+index);
    if (true) {
      // go with image based key key codes for now. make it an option later
      keyClass += " " + css.result_list_item_key + "-" + keyCode;
      keyClass += " " + css.result_list_item_key + "-" + "keymode";
      key = createDiv(null, keyClass);
      key.innerHTML = "&nbsp;";
    } else {
      key = createDiv("(" + keyCode + ")", keyClass);
    }
    resultDiv.appendChild(key);

    resultDiv.appendChild(tdiv);

    if (!result.addressLookupResult) {
      if (result.streetAddress && result.streetAddress != "") {
        var str = "&nbsp;-&nbsp;" + result.streetAddress;
        var addrDiv = createDiv(str, css.gs_street);

        resultDiv.appendChild(addrDiv);
      }
    }
    resultTd.appendChild(resultDiv);
    resultDiv.onclick = methodClosure(
                    gmls, LocalSearch.prototype.selectMarker, [index]);
    this.resultsListItem = resultDiv;
  }
}

LocalResult.prototype.getHtml = function() {
  var result = createDiv(null, css.result_wrapper);
  var node = this.result.html.cloneNode(true);
  result.appendChild(node);
  return result;
}

LocalResult.prototype.setMarker = function(icon) {
  this.marker = new GMarker(this.latLng, icon);
  this.marker.__ls__ = this;
  this.gmls.gmap.addOverlay(this.marker);
}

LocalResult.prototype.onClick = function() {
  this.gmls.selectMarker(this.index);
}


/**
 * Various Static DOM Wrappers.
*/
function methodClosure(object, method, opt_argArray) {
  return function() {
    return method.apply(object, opt_argArray);
  }
}

function methodCallback(object, method) {
  return function() {
    return method.apply(object, arguments);
  }
}

function createDiv(opt_text, opt_className) {
  var el = document.createElement("div");
  if (opt_text) {
    el.innerHTML = opt_text;
  }
  if (opt_className) { el.className = opt_className; }
  return el;
}

function removeChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function cssSetClass(el, className) {
  el.className = className;
}

function createTable(opt_className) {
  var el = document.createElement("table");
  if (opt_className) { el.className = opt_className; }
  return el;
}

function createTableRow(table) {
  var tr = table.insertRow(-1);
  return tr;
}

function createTableCell(tr, opt_className) {
  var td = tr.insertCell(-1);
  if (opt_className) { td.className = opt_className; }
  return td;
}

function createLink(href, text, opt_target, opt_className) {
  var el = document.createElement("a");
  el.href = href;
  el.appendChild(document.createTextNode(text));
  if (opt_className) {
    el.className = opt_className;
  }
  if (opt_target) {
    el.target = opt_target;
  }
  return el;
}

// from common, user agent detector
function br_AgentContains_(str) {
  if (str in br_AgentContains_cache_) {
    return br_AgentContains_cache_[str];
  }

  return br_AgentContains_cache_[str] =
    (navigator.userAgent.toLowerCase().indexOf(str) != -1);
}
var br_AgentContains_cache_ = {};
function br_IsIE() {
  return br_AgentContains_('msie');
}

function br_IsOpera() {
  return br_AgentContains_('opera');
}


GenerateAds = function(){
  // look for a reference to us which contains a possible
  // adsense key. IF adsense key is present then generate
  // inlinable ads. If not, don't do anything.
  var apiPattern = /localsearch\.js\?adsense=(.*)&?/;

  var loadCss = function(css) {
    document.write('<link href="' + css + '" rel="stylesheet" type="text/css"/>');
  }

  var adsenseKeyArg = null;
  var scripts = document.getElementsByTagName("script");
  if (scripts && scripts.length > 0) {
    for (var i=0; i < scripts.length; i++) {
      var src = scripts[i].src;
      var matches = src.match(apiPattern);
      if (matches) {
        adsenseKeyArg = matches[1];
        break;
      }
    }
  }

  if (adsenseKeyArg) {
    // arg is key[,adstyle[,mode]]
    // ok, now we have the adsense key and optional
    // ad type (inline, links, tower)
    var values=adsenseKeyArg.split(",");
    var adsenseKey = values[0];
    var adStyle = "inline";
    if (values.length > 1) {
      if (values[1] == "inline" ||
          values[1] == "strip" ||
          values[1] == "skyscraper" ||
          values[1] == "wide_skyscraper" ||
          values[1] == "button" ||
          values[1] == "vertical_banner"
          ) {
        adStyle = values[1];
      }
    }

    if (values.length > 2) {
      if (values[2] == "afs") {
        afsMode = true;
      } else if (values[2] == "afc") {
        afsMode = false;
      }
    }

    // having a problem relocating inline on opera
    // so disable until this is fixed
    if (br_IsOpera() && adStyle == "inline") {
      adStyle = "button";
    }

    if (afsMode) {
      if (LocalSearch.adFacts[adStyle].afsIndex == -1) {
        adStyle = "inline";
      }
    }

    var currentStyle = LocalSearch.adFacts[adStyle];

    // record the selected style
    var obj = new Object();
    for (p in LocalSearch.adFacts[adStyle]) {
      obj[p] = LocalSearch.adFacts[adStyle][p];
      obj["adsenseKey"] = adsenseKey;
    }
    LocalSearch.selectedStyle.push(obj);

    // now, write out an adsense unit using the appropriate
    // key and style

    if (afsMode) {
      document.write('<div id="_gmls_inline_ads_div_" class="gmls_inline_ads" style="display:none; position:absolute;"></div>');
      document.write('<script type="text/javascript">');
      document.write('var googleAdIframeTable = [["_gmls_inline_ads_div_",' +
                     currentStyle.afsIndex + ']];');
      document.write('var googleAdClient = "debug";');
      document.write('var googleAdChannel = "";');
      document.write('var googleAdIE = "UTF8";');
      document.write('var googleAdOE = "UTF8";');
      document.write('var googleAdHL = "' + UDS_CurrentLocale + '";');
      //document.write('var googleAdClient = "' + adsenseKey + '";');
      if (adsenseKey == "ca-google-ajaxapi") {
        document.write('var googleAdtest = "on";');
      }
      var width = currentStyle.width;
      var height = currentStyle.height;
      var format = currentStyle.format;

      var colors = LocalSearch.colorSchemes[currentStyle.colors];
      var color_border = colors.color_border;
      var color_text = colors.color_text;
      var color_url = colors.color_url;
      var color_line = colors.color_line;
      var color_link = colors.color_link;

      // pull from table indexed by style

      document.write('var googleAdColorDiv = "' + color_border + '";');
      document.write('var googleAdColorText = "' + color_text + '";');
      document.write('var googleAdColorAltText = "' + color_url + '";');
      document.write('var googleAdColorLink = "' + color_link + '";');
      document.write('var googleAdColorALink = "' + color_link + '";');
      document.write('var googleAdColorVLink = "' + color_url + '";');

      document.write('</script>');

      // defer load of afs bits until needed. main point of this is to ensure
      // that when this runs, the dynamicly created ad block is available.
    } else {
      document.write('<div id="_gmls_inline_ads_div_" class="gmls_inline_ads" style="display:none; position:absolute;">');
      document.write('<script type="text/javascript">');
      document.write('google_ad_client = "' + adsenseKey + '";');
      if (adsenseKey == "ca-google-ajaxapi") {
        document.write('google_adtest = "true";');
      }
      var width = currentStyle.width;
      var height = currentStyle.height;
      var format = currentStyle.format;

      var colors = LocalSearch.colorSchemes[currentStyle.colors];
      var color_border = colors.color_border;
      var color_text = colors.color_text;
      var color_url = colors.color_url;
      var color_line = colors.color_line;
      var color_link = colors.color_link;

      // pull from table indexed by style
      document.write('google_ad_width = ' + width + ';');
      document.write('google_ad_height = ' + height + ';');
      document.write('google_ad_format = "' + format + '";');

      document.write('google_color_border = "' + color_border + '";');
      document.write('google_color_text = "' + color_text + '";');
      document.write('google_color_url = "' + color_url + '";');
      document.write('google_color_line = "' + color_line + '";');
      document.write('google_color_link = "' + color_link + '";');

      document.write('google_dynamic_adsense_id = "_gmls_inline_ads_asid_";');
      document.write('google_dynamic_adsense_no_initial_ads = true;');
      document.write('</script>');
      document.write('<script src="http://pagead2.googlesyndication.com/pagead/show_dynamic_ads.js" type="text/javascript"></script>');
      document.write('</div>');
    }
  }
}

function loadAfs(url) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.charset = "utf-8";
  script.src = url;

  // add code to notice when this is done and
  // enable gadsense use
  head.appendChild(script);
}

LocalSearch.selectedStyle = [];
LocalSearch.adFacts = {
  "inline" : {
    afsIndex : 12,
    status : "done",
    width : 234,
    height : 60,
    format : "234x60_as",
    colors : "results",
    parent : "results"
  },

  "skyscraper" : {
    afsIndex : 2,
    status : "done",
    width : 120,
    height : 600,
    format : "120x600_as",
    colors : "map",
    parent : "map"
  },

  "wide_skyscraper" : {
    afsIndex : 3,
    status : "done",
    width : 160,
    height : 600,
    format : "160x600_as",
    colors : "map",
    parent : "map"
  },

  "button" : {
    afsIndex : -1,
    status : "done",
    width : 125,
    height : 125,
    format : "125x125_as",
    colors : "map",
    parent : "map"
  },

  "vertical_banner" : {
    afsIndex : -1,
    status : "done",
    width : 120,
    height : 240,
    format : "120x240_as",
    colors : "map",
    parent : "map"
  }
}

LocalSearch.colorSchemes = {
  "results" : {
    color_border : "f9f9f9",
    color_text : "878787",
    color_url : "878787",
    color_line : "878787",
    color_link : "7777cc"
  },

  "map" : {
    color_border : "f0f0f0",
    color_text : "878787",
    color_url : "008000",
    color_line : "878787",
    color_link : "7777cc"
  }
}

GenerateAds();

// an inline ads object
function InlineAds() {
  this.root = null;
  this.adDiv = document.getElementById("_gmls_inline_ads_div_");
  this.facts = LocalSearch.selectedStyle[0];
  this.searcher = null;

  // On IE, we have a little problem... The ad block that
  // we wrote out is not attached in the dom correctly. Its
  // parent is body, not this.adDiv so now we go on a little
  // fishing expedition...
  if (br_IsIE() && !afsMode) {
    var adDiv = this.adDiv;
    this.adDiv = null;
    var asu = window['google_dynamic_adsense_units']['_gmls_inline_ads_asid_'];
    if (asu) {
      // now whip through the object looking for our lost div...
      for (var p in asu) {
        if (asu[p] && asu[p].nodeType && asu[p].nodeType == 1 ) {
          var node = asu[p];
          if (node.parentNode.id != '_gmls_inline_ads_div_') {
            // we have a little problem. The node got
            // attached incorrectly, so now lift it and mode it
            node.parentNode.removeChild(node);
            this.adDiv = adDiv;
            this.adDiv.appendChild(node);
          }
        }
      }
    }
  }

  // detach from the dom. This will be re-attached
  // during super structure build out
  if (this.adDiv != null) {
    this.adDiv.parentNode.removeChild(this.adDiv);
  }
}

InlineAds.prototype.show = function() {
  this.root.style.display = "block";
  // only needed once, but we do it here until we decide
  // otherwise
  this.adDiv.style.display = "block";
}

InlineAds.prototype.hide = function() {
  this.root.style.display = "none";
}

InlineAds.prototype.fetch = function(q, results) {
  var query = q;
  var options = null;
  if (results.length > 1) {

    // if the view port was computed (meaning there is no near city, etc.)
    // in the query, then append on the phrase "near city" in hopes that
    // this will result in better targetting
    if (results[0].viewportmode && results[0].viewportmode == "computed") {
      if (results[0].city) {
        options = {
          google_city : results[0].city
        }
        if (results[0].region) {
          options.google_region = results[0].region;
        }
      }
    }
  }

  if (this.searcher == null) {
    var adId = null;
    if (!afsMode) {
      adId = "_gmls_inline_ads_asid_";
    }
    this.searcher = new GadSenseSearch(adId);
  }
  // todo - pass options when its fully supported
  this.searcher.execute(query);
}

function ExternalAds(adBlock) {
  this.adDiv = null;
  //
  // if we have been given a container then
  // we manage the visibility of the ad block. Note,
  // this will cause the ad block to flash
  if (adBlock.container) {
    this.adDiv = adBlock.container;
  }

  // note, no id passed for afs
  var id = null;
  if ( adBlock.adsense_id ) {
    id = adBlock.adsense_id;
  }
  this.searcher = new GadSenseSearch(id);
}

ExternalAds.prototype.show = function() {
  if (this.adDiv) {
    this.adDiv.style.display = "block";
  }
}

ExternalAds.prototype.hide = function() {
  if (this.adDiv) {
    this.adDiv.style.display = "none";
  }
}

ExternalAds.prototype.fetch = function(q, results) {
  var query = q;
  var options = null;
  if (results.length > 1) {

    // if the view port was computed (meaning there is no near city, etc.)
    // in the query, then append on the phrase "near city" in hopes that
    // this will result in better targetting
    if (results[0].viewportmode && results[0].viewportmode == "computed") {
      if (results[0].city) {
        options = {
          google_city : results[0].city,
          google_language : UDS_CurrentLocale
        }
        if (results[0].region) {
          options.google_region = results[0].region;
        }
      }
    }
  }
  // todo - pass options when its fully supported
  this.searcher.execute(query);
}

// classes used throughout
css = {};

// major states are
// active: search results are visible
// idle: search results are not showing, control is idle
css.control_root = "gmls";
css.app = "gmls-app";
css.app_compact_mode = "gmls-app-compact-mode";
css.app_full_mode = "gmls-app-full-mode";
css.app_active = "gmls-app gmls-active";
css.app_no_results = "gmls-app gmls-active gmls-no-results";
css.app_idle = "gmls-app gmls-idle";
css.app_external_results = "gmls-external-results";

// search form contains input box, search button, and branding
css.search_form_active = "gmls-search-form gmls-search-form-active";
css.search_form_idle = "gmls-search-form gmls-search-form-idle";
css.attribution = "gmls-attribution";

// results
css.results_popup = "gmls-results-popup";
css.results_list = "gmls-results-list";
css.results_table = "gmls-results-table";
css.results_ads_box = "gmls-results-ads-box";
css.results_controls = "gmls-results-controls";

css.result_list_item = "gmls-result-list-item";
css.result_list_item_selected = "gmls-result-list-item gmls-selected";
css.result_list_item_key = "gmls-result-list-item-key";
css.result_wrapper = "gmls-result-wrapper";
css.gs_title = "gs-title";
css.gs_street = "gs-street";

css.result_list_item_warning_symbol = "gmls-result-list-item-warning-symbol";
css.result_list_item_warning_text = "gmls-result-list-item-warning-text";

// scroll controls
css.prev_next = "gmls-prev-next";
css.prev_next_active = "gmls-prev-next gmls-prev-next-active";
css.prev_next_idle = "gmls-prev-next gmls-prev-next-idle";
css.prev_next_center = "gmls-prev-next-center";
css.prev = "gmls-prev";
css.prev_active = "gmls-prev gmls-prev-active";
css.prev_idle = "gmls-prev gmls-prev-idle";
css.next = "gmls-next";
css.next_active = "gmls-next gmls-next-active";
css.next_idle = "gmls-next gmls-next-idle";

// more/clear
css.more_results = "gmls-more-results";
css.clear_results = "gmls-clear-results";


// ads classes
css.ads = {
  "234x60_as" : "gmls-ads-box-234x60_as",               // inline
  "468x15_0ads_al" : "gmls-ads-box-468x15_0ads_al",     // strip
  "120x600_as" : "gmls-ads-box-120x600_as",             // skyscraper
  "160x600_as" : "gmls-ads-box-160x600_as",             // wide_skyscraper
  "125x125_as" : "gmls-ads-box-125x125_as",             // button
  "120x240_as" : "gmls-ads-box-120x240_as",             // vertical_banner
  "120x90_0ads_al" : "gmls-ads-box-120x90_0ads_al"      // links_120x90
}

}

