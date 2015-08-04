/**
 * @author Mingjin Wu, Fei Chen, Jeff Hall
 * Latest update: 2008/2/16
 * To control the torch relay schedule in the Frame and mark the locations and
 * paths on the Map;
 * Written by Mingjin Wu first, continued by Fei Chen from 2007/11/23
 * Further modification by Jeff Hall 2008/2/14
 *
 * Changes:
 * jhall - Modified code to use Google Maps API
 * jhall - Added some support for locale and internationalization
 *           JSON data file is dynamically selected by locale.
 *           Modify toZhDate() for English locale
 *           Improve info window to display wikipedia exerpt, link, and "Learn more about ..." Google Search link.
 * jhall - Move torch icon to far right side of pick list instead of bullet.
 * jhall - Use larger torch icon for map marker.
 * jhall - Attempt to hack in support for GMarkerManager. No support for Polylines, abandoned for now.
 * jhall - Correct error in milestone date comparison
 * jhall - Correct error in quickSearch algorithm which occasionally returned a city before its first date elapsed. 
 *
 */


/**
 * The class relative to the mapplet frame in the browser, used to display and
 * control the torch relay scheduler and the player.
 */
function Frame() {
  var TIME_SPAN = 5000;
  var currentCityId = null;
  
  /**
   * Do the real new region setup work in the frame. 
   * @param {int} region
   */
  this.setRegion = function(region) {
    var worldLink = document.getElementById("worldLink");
    var chinaLink = document.getElementById("chinaLink");
    var worldList = document.getElementById("worldList");
    var chinaList = document.getElementById("chinaList");
    if (region == TorchMgr.REGION_WORLD) {
      worldLink.className = "selected";
      chinaLink.className = "";
      worldList.className = "show";
      chinaList.className = "hide";
    } else {
      worldLink.className = "";
      chinaLink.className = "selected";
      worldList.className = "hide";
      chinaList.className = "show";
    }
  }

  /**
   * Change province node to expand/collapse.
   * @param {Eelment} nameNode The text node of province's name.
   */
  function changeProvinceStyle(cityNode) {
    var controlNode = cityNode.parentNode;
    if (controlNode.className.search(/hide/) != -1) {
      var result = controlNode.className.split(/\s*hide\s*/);
      controlNode.className = result.join(" ") + " show";
      collapseProvinces(cityNode.id);
    } else if(controlNode.className.search(/show/) != -1){
      var result = controlNode.className.split(/\s*show\s*/);
      controlNode.className = result.join(" ") + " hide";
    }
  }
	
	/**
	 * Collapse all province nodes except the special node.
	 * @param {String} opt_specialId The id of province node that needn't collapsed.
	 */
	function collapseProvinces(opt_specialId){
		var list = TorchMgr.chinaProvinceList;
		for(var i = 0, prov; prov = list[i]; i++){
			if(opt_specialId && prov.id == opt_specialId){
				continue;
			}
			var provNode = document.getElementById(prov.id).parentNode;
      if (provNode.className.search(/show/) != -1) {
        var result = provNode.className.split(/\s*show\s*/);
        provNode.className = result.join(" ") + " hide";
      }
		}
	}

  /**
   * Do the real new city setup work in the frame.
   * @param {City} city City Object.
   */
  function changeCity(city) {
  		TorchMgr.Log('[Frame#changeCity]');
		var cityId = city.id;
    // Restore the current city's style
    var currentCity = document.getElementById(currentCityId);
    if (currentCityId && currentCity) {
      var result = currentCity.className.split(/\s*selected\s*/);
      currentCity.className = result.join(" ");
    }
    // Highlight "new" current city.
    currentCityId = cityId;
    currentCity = document.getElementById(currentCityId);
    var className = currentCity.className;
    currentCity.className = className + " selected";
    // Change the style of the city's province if it is collapse, only when the
    // city under a province
    if (cityId.search(/^c/) == 0 && cityId.search(/^cp/) != 0) {
      var cityIndex = parseInt(cityId.match(/\d+/));
      var provinceId = TorchMgr.chinaCityList[cityIndex-TorchMgr.CHINA_LIST_START_INDEX].parentId;
      var provinceNode = document.getElementById(provinceId);
      if (provinceNode.parentNode.className.search(/hide/) != -1) {
        changeProvinceStyle(provinceNode);
      }
    }
		scrollToVisible(currentCity);
  }
	
	/**
	 * Auto scroll the city list.
	 * @param {Element} cityElem
	 */
	function scrollToVisible(cityElem){
    var topParent = document.getElementById("scrollWindow");
    var height = topParent.offsetHeight;
    var scrollTop = topParent.scrollTop;
    var nowPosition = getPosition(cityElem, topParent)-scrollTop;
    if(nowPosition > height){
      TorchMgr.Log(nowPosition + ' > ' + height);
      topParent.scrollTop = scrollTop + (nowPosition - height) + 2*cityElem.offsetHeight;
    }else if(nowPosition < 0){
      TorchMgr.Log(nowPosition + ' < 0');
      topParent.scrollTop = scrollTop + nowPosition - 2*cityElem.offsetHeight;
    }
    

    function getPosition(element, topParent) {
      var height = 0;
      for (var e = element;e && e != topParent; e = e.offsetParent)
        height += e.offsetTop;
      for (e = element.parentNode;e && e != topParent; e = e.parentNode)
        if (e.scrollTop)
          height -= e.scrollTop;
      return height;
    }
  }

  /**
   * Perform as the event listener on the event of name node click.
   */
  function onCityNameClick() {
    var cityId = this.parentNode.id;
		var city = TorchMgr.getCityById(cityId);
    if (city.type == TorchMgr.TYPE_CHINA_PROVINCE) {
      changeProvinceStyle(this.parentNode);
    }
    if (currentCityId != cityId) {
      changeCity(city);
      TorchMgr.setCity(city, TorchMgr.EVENT_FROM_FRAME);
    }
  }

  /**
   * Add cityList into frame and define relative node and event.
   * @param {Array} cityList The list of cities.
   * @param {int} startIndex The start index indicat where should be started to
   *                         add the city into the frame.
   * @param {int} endIndex The end index indicate where should be stopped adding
   *                       the city into the frame.
   * @param {String} cityStatus Indicate all the cities's status that added into 
   *                            the frame.
   * @param {String} cityType Indicate all the cities's type that added into
   *                          the frame.
   */
  this.importCity = function(cityList, startIndex, endIndex, cityStatus, cityType) {
   /**
     * Inner function of importCity(). Define the "li" tag to wrap the city.
     * Its id equals city's id, class determined by city status to display
     * relative icon.
     * NOTE: If the city is province type, its default cities list is hide.
     * @param {City} city
     */
    function createCityNode(city, className) {
      var cityNode = document.createElement("li");
      cityNode.className = className;
      var torchIcon = document.createElement("span");
      torchIcon.className = "torch";
      torchIcon.innerHTML = "&nbsp;";
      cityNode.appendChild(torchIcon);

	  var parentNode;
      switch (city.type) {
        case TorchMgr.TYPE_WORLD_CITY:
	  city.parentId = "worldList";
          cityNode.setAttribute("id",city.id);
          parentNode = document.getElementById("worldList");
          parentNode.appendChild(cityNode);
          break;
        case TorchMgr.TYPE_CHINA_PROVINCE:
	  city.parentId = "chinaList";
          cityNode.setAttribute("id",city.id);
          parentNode = document.getElementById("chinaList");
          // Create div wrapper first
          var divWrapper = document.createElement("div");
          divWrapper.className = "province hide";
          parentNode.appendChild(divWrapper);
          divWrapper.appendChild(cityNode);
          // Create 'ul' tag
          var provinceUL = document.createElement("ul");
          divWrapper.appendChild(provinceUL);
          break;
        case TorchMgr.TYPE_CHINA_CITY:
	  city.parentId = "cp" + city.prtIndex;
          cityNode.setAttribute("id",city.id);
          parentNode = document.getElementById(city.parentId).nextSibling; // The "ul" tag node
          if(city.prtAction == "before")
          {
            document.getElementById("chinaList").insertBefore(cityNode, document.getElementById(city.parentId).parentNode);
          }
          else
          {
            parentNode.appendChild(cityNode);
          }
          break;
      }
      
      return cityNode;
    }
    
    /**
     * Inner function of importCity(). Define a "a" tag to wrap the city name
     * and add event.
     * @param {String} name City name.
     * @param {Element} cityNode The "li" tag element.
     */
    function createNameNode(name, cityNode) {
      var nameNode = document.createElement("a");
      nameNode.className = "name";
      nameNode.setAttribute("href","#"); // Make the ':hover' act
      cityNode.appendChild(nameNode);
      nameNode.appendChild(document.createTextNode(name));
      nameNode.onclick = onCityNameClick;
    }
    
    /**
     * Inner function of importCity(). Define a "span" tag to wrap the city
     * date.
     * @param {String} date Torch relay date in the city.
     * @param {Element} cityNode The "li" tag element.
     */
    function createDateNode(date, cityNode) {
      var dateNode = document.createElement("div");
      dateNode.className = "date";
      cityNode.appendChild(dateNode);
      var localDate = TorchMgr.toLocaleDate(date);
      dateNode.appendChild(document.createTextNode(localDate));
    }
    
    
    // constructor
    var cityClassName = (cityStatus == TorchMgr.STATUS_NOTORCH) ? "noTorch" : "torched";
    for (var i = startIndex; i <= endIndex; i++) {
	  
      var city = cityList[i];
	  if('undefined' == typeof(city))
	  {
	  	continue;
	  }
      city.type = cityType;
      city.id = cityType + city.index;
	  className = (TorchMgr.torchCity == cityList[i]) ? "hasTorch torched" : cityClassName;
      var cityNode = createCityNode(city, className);
      createNameNode(city.name, cityNode);
      createDateNode(city.date, cityNode);
    }
  }

  /**
   * Invoked by TorchMgr.setCity(), and change the current city in the frame.
   * @param {City} city The target city to go to.
   * @param {int} opt_region If the region is also changed, this should be given.
   */
  this.setCity = function(city) {
  		TorchMgr.Log('[Frame.setCity]');
		changeCity(city);
  }

  /**
   * Frame initiation.
   * @param {int} region Indicate which region frame should start and display.
   */
  this.init = function(region) {

	/**
	 * Creates localized region links
	 */
	function updateRegionLinks(){
		var worldLink = document.getElementById('worldLink');
		var chinaLink = document.getElementById('chinaLink');
		worldLink.innerHTML = (TorchMgr.localizedText ? TorchMgr.localizedText.worldLink : worldLink.innerHTML);
		chinaLink.innerHTML = (TorchMgr.localizedText ? TorchMgr.localizedText.chinaLink : chinaLink.innerHTML);
	}
    /**
     * Inner function of init(). Define the city player in the frame.
     */
    function showPlayer() {
      /**
       * Inner function of showPlayer().
       */
      function setButton(id, clickCall) {
        var button = document.getElementById(id);
        button.onclick = clickCall;
      }
      
      /**
       * Inner function of showPlayer().
       */
      function play() {
				var currentCity = TorchMgr.currentCity;
				if (TorchMgr.currentCity.id.search(/^cp/) == 0) {
					var cityList = TorchMgr.chinaCityList;
					var firstCity = document
							.getElementById(TorchMgr.currentCity.id).nextSibling.firstChild;
					var cityIndex = parseInt(firstCity.id.match(/\d+/));
					currentCity = TorchMgr.currentCity = cityList[cityIndex - TorchMgr.CHINA_LIST_START_INDEX];
				}
				TorchMgr.map.setCity(currentCity);
				TorchMgr.frame.setCity(currentCity);

				TorchMgr.playerIntervalId = setInterval("TorchMgr.toNext(1);",
						TIME_SPAN);
				document.getElementById("playButton").style.display = "none";
				document.getElementById("pauseButton").style.display = "block";
			}
      
      /**
       * Inner function of showPlayer().
       */
      function stop() {
        clearInterval(TorchMgr.playerIntervalId);
        TorchMgr.playerIntervalId == null;
      }
      
      /**
       * Inner function of showPlayer().
       */
      function pause() {
        stop();
        document.getElementById("playButton").style.display = "block";
        document.getElementById("pauseButton").style.display = "none";
      }
      
      /**
       * Inner function of showPlayer().
       */
      function previous() {
        pause();
        TorchMgr.toNext(0);
      }
      
      /**
       * Inner function of showPlayer().
       */
      function next() {
        pause();
        TorchMgr.toNext(1);
      }
      
      // showPlayer() constructor
      setButton("prevButton", previous);
      setButton("playButton", play);
      setButton("pauseButton", pause);
      setButton("nextButton", next);
    }
    
    function showScroll() {
			var topParent = document.getElementById("boardContent");
			var childHeight = getChildOffsetHeight(topParent);
			if (childHeight < topParent.offsetHeight) {
				document.getElementById("scrollUp").style.display = "none";
				document.getElementById("scrollDown").style.display = "none";
			} 

			function getChildOffsetHeight(elem) {
				var childNodes = elem.getElementsByTagName("ul");
				var height = 0;
				for (var i = 0, node;node = childNodes[i]; i++) {
					height += node.offsetHeight;
				}
				return height;
			}
		} 
    
    // init() constructor
    var defaultCity;
        switch(region)
        {
        	case TorchMgr.REGION_WORLD:
        		defaultCity = TorchMgr.worldDefaultCity;
        		break;
        	case TorchMgr.REGION_CHINA:
        		defaultCity = TorchMgr.chinaDefaultCity;
        		break;
        	default:
        		
        }
		showPlayer();
		updateRegionLinks();
		this.setRegion(region);
		if(TorchMgr.torchCity){
			this.setCity(TorchMgr.torchCity);
		}
		else
		{
			this.setCity(defaultCity);
		}
		showScroll();
  }
}

/**
 * The class relative to the map in the browser, used to display and
 * control the torch relay locations and path.
 */
function Map(mapDiv) {
  var TORCH_ICON_URL = TorchMgr.SITE_URL + TorchMgr.IMAGES_PATH + "olympic-torch-36.png";
  var TORCH_ICON_SHADOW_URL = TorchMgr.SITE_URL + TorchMgr.IMAGES_PATH + "torchShadow.png";
  var GRAY_ICON_URL = TorchMgr.SITE_URL + TorchMgr.IMAGES_PATH + "dot-gray-transparent.png";
  var RED_ICON_URL = TorchMgr.SITE_URL + TorchMgr.IMAGES_PATH + "dot-red-transparent.png";
  var BLUE_ICON_URL = TorchMgr.SITE_URL + TorchMgr.IMAGES_PATH + "dot-blue-transparent.png";
  var grayIcon = createIcon(GRAY_ICON_URL, new google.maps.Size(12, 12), new google.maps.Point(6, 6), new google.maps.Point(6, 4));
  var redIcon = createIcon(RED_ICON_URL, new google.maps.Size(12, 12), new google.maps.Point(6, 6), new google.maps.Point(6, 4));
  var blueIcon = createIcon(BLUE_ICON_URL, new google.maps.Size(12, 12), new google.maps.Point(6, 6), new google.maps.Point(6, 4));
  var torchIcon = createIcon(TORCH_ICON_URL, new google.maps.Size(36, 36), new google.maps.Point(5, 30), new google.maps.Point(9, 4));
  
  torchIcon.shadow = TORCH_ICON_SHADOW_URL;
  torchIcon.shadowSize = new google.maps.Size(35,22);
  var grayLineColor = "#333333";
  var redLineColor = "#ff0000";
  var worldCenter = new google.maps.LatLng(37.633300, 21.616759);
  var chinaCenter = new google.maps.LatLng(34.264915, 108.954401);
  var DEFAULT_WORLD_LEVEL = 3;
  var DEFAULT_CHINA_LEVEL = 4;
  var DEFAULT_PROV_LEVEL = 8;
  
  if(!mapDiv)
  {
  	throw new Error("Can't get torch map");
  }
  
  /////////////////////////////////////////////////////////////////////////
  /**
   *  Torch Player Map Control
   *  Modified from original to derive from GControl
   */
  dm = function() {}
  dm.TorchPlayerControl = function() 
  {
  	google.maps.Control.call(this, false, false); 
  }

  dm.TorchPlayerControl.prototype = new google.maps.Control();

  dm.TorchPlayerControl.prototype.initialize = function(map)
  {
  	/*
  	   <a class="player prevButton" id="prevButton" href="#"></a>
         <a class="player playButton" id="playButton" href="#"></a>
         <a class="player pauseButton" id="pauseButton" href="#"></a>
         <a class="player nextButton" id="nextButton" href="#"></a>
  */
  	var containerElement = map.getContainer();
  	var playerContainer = document.createElement('div');
  	playerContainer.className = "playerControl";

  	var prevButton = document.createElement('a');
  	prevButton.className = "player prevButton";
  	prevButton.id = "prevButton";
  	prevButton.setAttribute("href", "#");

  	var playButton = document.createElement('a');
  	playButton.className = "player playButton";
  	playButton.id = "playButton";
  	playButton.setAttribute("href", "#");

  	var pauseButton = document.createElement('a');
  	pauseButton.className = "player pauseButton";
  	pauseButton.id = "pauseButton";
  	pauseButton.setAttribute("href", "#");

  	var nextButton = document.createElement('a');
  	nextButton.className = "player nextButton";
  	nextButton.id = "nextButton";
  	nextButton.setAttribute("href", "#");

  	playerContainer.appendChild(prevButton);
  	playerContainer.appendChild(playButton);
  	playerContainer.appendChild(pauseButton);
  	playerContainer.appendChild(nextButton);

  	containerElement.appendChild(playerContainer);
  	return playerContainer;
  }

  dm.TorchPlayerControl.prototype.getDefaultPosition = function()
  {
  	return new google.maps.ControlPosition(google.maps.ANCHOR_TOP_RIGHT, new google.maps.Size(10, 30) );
  }

  dm.TorchPlayerControl.prototype.printable = function()
  {
  	return false;
  }

  dm.TorchPlayerControl.prototype.selectable = function()
  {
  	return false;
  }
  ////////////////////////////////////////////////////////////////////
  
  // Force init of Google Map
  var gmap = new google.maps.Map2(mapDiv);
  gmap.setCenter(new GLatLng(37.4419, -122.1419), 13);
  
  gmap.addControl(new google.maps.LargeMapControl());
  gmap.addControl(new google.maps.ScaleControl());
  gmap.addControl(new google.maps.MapTypeControl());
  gmap.addControl(new dm.TorchPlayerControl());
    
  var overlayManager = new OverlayManager(gmap);		// For backward compatability
  var torchMarker = null;
  var selectionMarker = null;
  
  /**
   * The manager class to manage the markers and polylines, including adding the
   * overlays to map, and hiding or showing them.
   * @param {GMap2} gmap
   */
  function OverlayManager(gmap) {
    var LEVEL_RANGE_WORLD = [1, 3];
    var LEVEL_RANGE_CHINA = [4, 17];
    var LEVEL_RANGE_CHINA_PROV = [4, 5];
    var LEVEL_RANGE_CHINA_CITY = [6, 17];
    var LEVEL_WORLD = 1;
    var LEVEL_CHINA = 2;
    var LEVEL_CHINA_PROV = 3;
    var LEVEL_CHINA_CITY = 4;
    
    var map = gmap;
    
	// Hack in support for GMarkerManager
	//var markerManager = new google.maps.MarkerManager(gmap);
    
		// All overlays arrays' first elem store the flag as added or not
		// and the second elem store the flag as showed or not 
	
		var worldCityMarkers = [false/*isAdded*/, false/*isShowed*/];
		var chinaCityMarkers = [false, false];
		var chinaProvinceMarkers = [false, false];
		var worldPolylines = [false, false];
		var chinaPolylines = [false, false];
		
		/* Hack in support for GMarkerManager
		var worldCityMarkers = [];
		var chinaCityMarkers = [];
		var chinaProvinceMarkers = [];
		var worldPolylines = [];
		var chinaPolylines = [];
		*/
		
		/**
		 * Show all the overlays in the given list.
		 * Note: if the overlays are not added to the map, add them.
		 * @param {Array} overlayList The list of overlays.
		 */

    function showOverlays(overlayList) {
      if (!overlayList[0]) {
        add(overlayList);
        overlayList[0] = true;
		overlayList[1] = true;
      } else if (!overlayList[1]) {
        show(overlayList);
        overlayList[1] = true;
      }

			/**
			 * Inner function, add the overlays into map.
			 * @param {Array} overlayList
			 */

      function add(overlayList) {
        for (var i = 2, overlay; overlay = overlayList[i]; i++) {
          map.addOverlay(overlay);
        }
      }

			/**
			 * Inner function, show the overlays.
			 * @param {Array} overlayList 
			 */

      function show(overlayList) {
        for (var i = 2, overlay; overlay = overlayList[i]; i++) {
          overlay.show();
        }
      }
    }

		/**
     * Hide all the overlays in the given list, if still not added to the map,
     * do nothing.
     * @param {Array} overlayList
     */

    function hideOverlays(overlayList) {
		if (overlayList[0] && overlayList[1]) {
        hide(overlayList);
        overlayList[1] = false;
      }

			/**
       * Inner function, hide the overlays.
       * @param {Array} overlayList 
       */

      function hide(overlayList) {
        for (var i = 2, overlay; overlay = overlayList[i]; i++) {
          overlay.hide();
        }
      }
    }

    /**
     * Add marker into the overlayManager.
     * @param {GMarker} marker
     * @param {int} cityType
     */

    this.addMarker = function(marker, cityType) {
		switch (cityType) {
        case TorchMgr.TYPE_WORLD_CITY:
          worldCityMarkers.push(marker);
          break;
        case TorchMgr.TYPE_CHINA_CITY:
          chinaCityMarkers.push(marker);
          break;
        case TorchMgr.TYPE_CHINA_PROVINCE:
          chinaProvinceMarkers.push(marker);
      }
    }
		
		/**
		 * Add polyline into the overlayManager.
		 * @param {GPolyline} polyline
		 * @param {int} cityType
		 */
    this.addPolyline = function(polyline, cityType) {
		switch (cityType) {
        case TorchMgr.TYPE_WORLD_CITY:
          worldPolylines.push(polyline);
          break;
        case TorchMgr.TYPE_CHINA_CITY:
          chinaPolylines.push(polyline);
      }
    }
		
		/**
		 * Invoked when the region is changed.
		 * @param {int} region
		 */
    this.refresh = function(region) {
		switch (region) {
        case TorchMgr.REGION_WORLD:
				  map.setCenter(worldCenter, DEFAULT_WORLD_LEVEL);
          break;
        case TorchMgr.REGION_CHINA:
				  map.setCenter(chinaCenter, DEFAULT_CHINA_LEVEL);
      }
      // Hack in support for GMarkerManager
      //markerManager.refresh();
    }
    
    /*  Try to hack in support for GMarkerManager.
    this.markerInitComplete = function(){
    	markerManager.addMarkers(worldCityMarkers, LEVEL_RANGE_WORLD[0], LEVEL_RANGE_WORLD[1]);
        markerManager.addMarker(worldPolylines[0], LEVEL_RANGE_WORLD[0], LEVEL_RANGE_WORLD[1]);
    	markerManager.addMarkers(worldPolylines, LEVEL_RANGE_WORLD[0], LEVEL_RANGE_WORLD[1]);

    	markerManager.addMarkers(chinaProvinceMarkers, LEVEL_RANGE_CHINA_PROV[0], LEVEL_RANGE_CHINA_PROV[1]);

    	markerManager.addMarkers(chinaCityMarkers, LEVEL_RANGE_CHINA_CITY[0], LEVEL_RANGE_CHINA_CITY[1]);
    	markerManager.addMarkers(chinaPolylines, LEVEL_RANGE_CHINA_CITY[0], LEVEL_RANGE_CHINA_CITY[1]);
    }
    */
		
		/**
		 * Show special markers according to the level range.
		 * @param {int} levelRange
		 */

    function showMarkers(levelRange) {
      switch (levelRange) {
        case LEVEL_CHINA_PROV:
          showOverlays(chinaProvinceMarkers);
          break;
        case LEVEL_CHINA_CITY:
          showOverlays(chinaCityMarkers);
          break;
        case LEVEL_WORLD:
          showOverlays(worldCityMarkers);
      }
    }
		
		/**
		 * Hide special markers according to the level range.
		 * @param {int} levelRange
		 */

		function hideMarkers(levelRange) {
      switch (levelRange) {
        case LEVEL_CHINA_PROV:
          hideOverlays(chinaProvinceMarkers);
          break;
        case LEVEL_CHINA_CITY:
          hideOverlays(chinaCityMarkers);
          break;
        case LEVEL_WORLD:
          hideOverlays(worldCityMarkers);
      }
    }
		
		/**
		 * Show special polylines according to the level range.
		 * @param {int} levelRange
		 */

		function showPolylines(levelRange) {
      switch (levelRange) {
        case LEVEL_WORLD:
          showOverlays(worldPolylines);
					break;
        case LEVEL_CHINA_PROV:
				case LEVEL_CHINA_CITY:
          showOverlays(chinaPolylines);
      }
    }
		
		/**
		 * Hide special polylines according to the level range.
		 * @param {Object} levelRange
		 */

    function hidePolylines(levelRange) {
      switch (levelRange) {
        case LEVEL_WORLD:
          hideOverlays(worldPolylines);
					break;
        case LEVEL_CHINA_PROV:
        case LEVEL_CHINA_CITY:
          hideOverlays(chinaPolylines);
      }
    }
		
		/**
		 * Get level range according to the given level.
		 * @param {int} level The Google map's level.
		 */
    function getLevelRange(level) {
      if (LEVEL_RANGE_CHINA_PROV[0] <= level && level <= LEVEL_RANGE_CHINA_PROV[1]) {
        return LEVEL_CHINA_PROV;
      }
      if (LEVEL_RANGE_CHINA_CITY[0] <= level && level <= LEVEL_RANGE_CHINA_CITY[1]) {
        return LEVEL_CHINA_CITY;
      }
      if (LEVEL_RANGE_WORLD[0] <= level && level <= LEVEL_RANGE_WORLD[1]) {
        return LEVEL_WORLD;
      }
    }
    
		/**
		 * Get region code according the the special level.
		 * @param {int} newLevel The Google map's level.
		 */
		this.getRegionByLevel = function(level) {
			if ( level >= LEVEL_RANGE_CHINA[0]) {
        return TorchMgr.REGION_CHINA;
      } else if ( level <= LEVEL_RANGE_WORLD[1]) {
        return TorchMgr.REGION_WORLD;   
      }
		}
		
		/**
		 * Control the overlays' display on the map according to the levels. 
		 * @param {int} oldLevel The Google Map's level. 
		 *                       Need to hide overlays on this level.
		 * @param {int} newLevel The Google Map's level.
		 *                       Need to show overlays on this level.
		 */

    this.changeOverlays = function(oldLevel, newLevel) {
	  var oldLevelRange = getLevelRange(oldLevel);
      var newLevelRange = getLevelRange(newLevel);
      if (oldLevelRange != newLevelRange) {
        if(torchMarker)
        {	
        	gmap.removeOverlay(torchMarker);
        }
        if(selectionMarker)
        {
        	gmap.removeOverlay(selectionMarker);
        }
        hideMarkers(oldLevelRange);
		hidePolylines(oldLevelRange);
        showMarkers(newLevelRange);
        showPolylines(newLevelRange);
		// Prevent torch marker from being underneath other markers.
        if(selectionMarker)
        {
        	gmap.addOverlay(selectionMarker);
        }

        if(torchMarker)
        {
	        gmap.addOverlay(torchMarker);
        }
        
      }
    }

  }

  /**
   * Do the real new city setup work in the map.
   * @param {City} city The target city to go to.
   */
  function changeCity(city) {
    TorchMgr.Log('[Map#changeCity] ' + city.id);
    if (selectionMarker) {
      gmap.removeOverlay(selectionMarker);
      //torchMarker.setPoint(new google.maps.LatLng(city.lat, city.lng));
      selectionMarker.setPoint(new google.maps.LatLng(city.lat, city.lng));
    } else {
      //torchMarker = new google.maps.Marker(new google.maps.LatLng(city.lat, city.lng), { icon : torchIcon });
      selectionMarker = new google.maps.Marker(new google.maps.LatLng(city.lat, city.lng), {icon: blueIcon} );
    }

    if(torchMarker)
    {
    	gmap.removeOverlay(torchMarker);
    }
    

    gmap.panTo(new google.maps.LatLng(city.lat, city.lng));
    gmap.addOverlay(selectionMarker);
	
	// Force torch to overlay any other markers.
    if(torchMarker)
    {
    	gmap.addOverlay(torchMarker);
    }

    //addMarkerEvent(torchMarker, city);
    addMarkerEvent(selectionMarker, city);
    
    // Show info window
    openInfoWindow(selectionMarker, city);
  }
	
	function getInfoWindowHtml(city) {
	    var shortName = city.name.split('-')[0];
	    
	    var image = "";
	    if(TorchMgr.cityImageList && city.index < TorchMgr.cityImageList.length)
	    {
			image = '<img width="200" style="margin:auto" src="' + TorchMgr.cityImageList[city.index].picURL + '" alt="Image of ' + city.name + '"></img>';
	    }	    
	    	    
	    var learnLink = '<p style="font-size:10pt;font-family:sans-serif;">' + city.learnMore + '</p>';
		var imageLink = '<a href="' + TorchMgr.cityImageList[city.index].pageURL + '" target="_blank">' + image + '</a>';
		var html = '<span style="font-size: 12pt; font-weight: bold;margin-right: 10px">' + city.name + '</span><br/>';
		html += '<span style="font-size: 9pt; color: #333;font-weight:normal;margin-right: 5px;">' + TorchMgr.toLocaleDate(city.date) + '</span>';
    	html += '<div style="text-align:center">';
    	if(city.type != TorchMgr.TYPE_CHINA_PROVINCE)
      {
    	   html += imageLink;
 	   }
    	html += '</div>';
    	html += '<div style="bottom:0"><p style="font-size:9pt; font-family:sans-serif;">' 
			+ (city.info != undefined ? city.info : "") + '</p>' 
			+ '<div style="font-size: 9pt">' + (city.attribution != undefined ? city.attribution : "") + '</div>'
			+ (city.learnMore ? learnLink : "") + '</div>';
		return html;
	}
	

  /**
   * A helper method to create GIcon object.
   */
  function createIcon(image, iconSize, iconAnchor, infoWindowAnchor) {
    var icon = new google.maps.Icon();
    icon.image = image;
    icon.iconSize = iconSize;
    icon.iconAnchor = iconAnchor;
    icon.infoWindowAnchor = infoWindowAnchor;
    return icon;
  }
  
  /**
	 * A helper method to add marker event listener.
	 * 
	 * @param {GMarker}  marker
	 * @param {City}  city
	 */
	function addMarkerEvent(marker, city) {
		google.maps.Event.addListener(marker, 'click', function() {
			changeCity(city);
			TorchMgr.setCity(city, TorchMgr.EVENT_FROM_MAP);
		});
	}
	
  /**
	 * Define relative maker and polyline. NOTE: Different from the frame, there
	 * is still not add city into map.
	 * 
	 * @param city
	 *            The city get from the city data.
	 */
  this.importCity = function(cityList, startIndex, endIndex, cityStatus, cityType) {
		var icon = (cityStatus == TorchMgr.STATUS_NOTORCH) ? grayIcon : redIcon;
		var points = [];
        /* Start with first city */
		//var city = cityList[startIndex];
	  	//points.push(new google.maps.LatLng(city.lat, city.lng));

    for (var i = startIndex; i <= endIndex; i++) {
      var city = cityList[i];
	  if('undefined' == typeof(city))
	  {
	  	continue;
	  }
	  var point = new google.maps.LatLng(city.lat, city.lng);
      var marker = new google.maps.Marker(point, { icon: icon, title: city.name });
      
      overlayManager.addMarker(marker, cityType);
      	
      	addMarkerEvent(marker, city);
      	// Hack in support for GMarkerManager
      	//markers.push(marker);
		points.push(point);
	}
	var city = cityList[startIndex];
	
    if ('undefined' != typeof(city) && city.type != TorchMgr.TYPE_CHINA_PROVINCE && points.length > 0) {
      var polylineColor = (cityStatus == TorchMgr.STATUS_NOTORCH) ? grayLineColor : redLineColor;
      for(var i = 1, point; point = points[i]; i++){
		var polyline = new google.maps.Polyline([points[i-1], point], polylineColor, 2, 1);
        
        overlayManager.addPolyline(polyline, cityType);
        // Hack in support for GMarkerManager
        //polylines.push(polyline);
	  }
    }
    
/* Hack in support for GMarkerManager
    switch(cityType)
    {
		case TorchMgr.TYPE_WORLD_CITY:
			markerManager.addMarkers(markers, LEVEL_RANGE_WORLD_CITY[0], LEVEL_RANGE_WORLD_CITY[1]);
			markerManager.addMarkers(polylines, LEVEL_RANGE_WORLD_CITY[0], LEVEL_RANGE_WORLD_CITY[1]);
		break;
		case TorchMgr.TYPE_CHINA_PROVINCE:
			markerManager.addMarkers(markers, LEVEL_RANGE_CHINA_PROV[0], LEVEL_RANGE_CHINA_PROV[1]);
			markerManager.addMarkers(polylines, LEVEL_RANGE_WORLD_CITY[0], LEVEL_RANGE_WORLD_CITY[1]);
        break;
		case TorchMgr.TYPE_CHINA_CITY:
			markerManager.addMarkers(markers, LEVEL_RANGE_CHINA_CITY[0], LEVEL_RANGE_CHINA_CITY[1]);
			markerManager.addMarkers(polylines, LEVEL_RANGE_WORLD_CITY[0], LEVEL_RANGE_WORLD_CITY[1]);
        break;
    }
*/
  }

  /**
   * Invoked by TorchMgr.setCity(), and change the current city in the map.
   * @param {City} city The target city to go to.
   */
  this.setCity = function(city) {
    TorchMgr.Log('[Map.setCity]' + city.id);
		switch(city.type){
			case TorchMgr.TYPE_WORLD_CITY:
			 	gmap.setZoom(DEFAULT_WORLD_LEVEL);
				break;
			case TorchMgr.TYPE_CHINA_PROVINCE:
        		gmap.setZoom(DEFAULT_CHINA_LEVEL);
        		break;
			case TorchMgr.TYPE_CHINA_CITY:
        		gmap.setZoom(DEFAULT_PROV_LEVEL);
        		break;
		}
    changeCity(city);

  }
	
	/**
	 * To set the map's display region.
	 * @param {int} region The region code.
	 */
	this.setRegion = function(region) {
		if (selectionMarker) {
			gmap.removeOverlay(selectionMarker);
		}
    overlayManager.refresh(region);
    // Hack in support for GMarkerManager
    //markerManager.refresh();
	}
	
	/**
	 * Opens the info window for the specified city.  Mainly a convience method.
	 * @param {City} city The target city's info window to open
	 */
	this.openInfoWindow = function (city) {
	    TorchMgr.Log('[Map.openInfoWindow]');
		openInfoWindow(selectionMarker, city);
	}
	
	function openInfoWindow(selMarker, city){
	    TorchMgr.Log('[Map#openInfoWindow] ' + selMarker + ", " + city );
	    
		if(TorchMgr.cityImageList)
		{
			var infoWindowHtml = getInfoWindowHtml(city);	    
	    	google.maps.Event.addListener(TorchMgr, "precacheComplete", function(){
	    		TorchMgr.Log('Fired image precache event ' + selMarker);
	    		var tabs = [];
				tabs.push(new google.maps.InfoWindowTab(TorchMgr.localizedText.info, '<div class="torchInfoViewer">' + infoWindowHtml + '</div>'));
				if(city.video)
				{
					var videoHtml = '<div style="text-align:center;"><object width="240" height="193">'
					+ '<param name="movie" value="http://intl.2008.cctv.com/newplayer/player.swf"></param>'
					+ '<param name="allowScriptAccess" value="always"></param>'
					+ '<param name="wmode" value="window"></param>'
					+ '<param name="flashvars" value="size=1&id=' + city.video + '&site=http://2008.cctv.com"></param>'
					+ '<embed flashvars="size=1&id=' + city.video + '&site=http://intl.2008.cctv.com" src="http://intl.2008.cctv.com/newplayer/player.swf"'
					+ 'type="application/x-shockwave-flash"  width="240" height="193" allowFullScreen="true" wmode="window" allowScriptAccess="always"></embed>'
					+ '</object></div>';
					
					videoHtml += "<div id='infoWindowFooter'>";
					videoHtml += TorchMgr.localizedText.videoCopyright ? "<div class='vidCopyright'>" + TorchMgr.localizedText.videoCopyright + "</div>" : "";
					videoHtml += TorchMgr.localizedText.webLink ? TorchMgr.localizedText.webLink : "";
					videoHtml += TorchMgr.localizedText.videoDisclaimer ? "<div class='videoDisclaimer'>" + TorchMgr.localizedText.videoDisclaimer + "</div>" : "";
					videoHtml += "</div>";
					tabs.push(new google.maps.InfoWindowTab(TorchMgr.localizedText.video, '<div class="torchInfoViewer">' + videoHtml + '</div>'));
				}
	    		
	    		selMarker.openInfoWindowTabsHtml( tabs, { maxWidth: 255, disableGoogleLinks : true });
	    	});
			// Precache image
			TorchMgr.precacheCityImage(TorchMgr.cityImageList[city.index].picURL);
		}
	
		
		
	    //selectionMarker.openInfoWindowTabsHtml( tabs, { maxWidth: 400, disableGoogleLinks : true });
	}

 /**
   * Map initiation.
   * @param {int} region Indicate which region map should start from and display.
   */
  this.init = function(region) {
	var defaultCity;
	gmap.clearOverlays();
		// A hack to show overlays when init
    switch (region) {
      case TorchMgr.REGION_WORLD:
        defaultCity = TorchMgr.worldDefaultCity;
        overlayManager.changeOverlays(DEFAULT_CHINA_LEVEL, DEFAULT_WORLD_LEVEL);
        break;
      case TorchMgr.REGION_CHINA:
        defaultCity = TorchMgr.chinaDefaultCity;
        overlayManager.changeOverlays(DEFAULT_WORLD_LEVEL, DEFAULT_CHINA_LEVEL);
    }
    
    // Hack in support for GMarkerManager
    //overlayManager.markerInitComplete();
    
    this.setRegion(region);
        TorchMgr.Log('[Map.init.setRegion] ' + region.id);
		google.maps.Event.addListener(gmap, "zoomend", function(oldLevel, newLevel) {
			var region = overlayManager.getRegionByLevel(newLevel);
      		if (region != TorchMgr.currentRegion) {
				TorchMgr.setRegion(region, TorchMgr.EVENT_FROM_MAP);
			}
			overlayManager.changeOverlays(oldLevel, newLevel);
    });
		
	if (TorchMgr.torchCity) {
      var city = TorchMgr.torchCity;
      torchMarker = new google.maps.Marker(new google.maps.LatLng(city.lat, city.lng), { icon : torchIcon });
      selectionMarker = new google.maps.Marker(new google.maps.LatLng(city.lat, city.lng), {icon: blueIcon});
		gmap.addOverlay(selectionMarker);
		gmap.addOverlay(torchMarker);
		addMarkerEvent(torchMarker, city);
		addMarkerEvent(selectionMarker, city);
		// Need to open info window, as well.
		openInfoWindow(selectionMarker, city);
    }
    else
    {
    	this.setCity(defaultCity);
    	openInfoWindow(selectionMarker, defaultCity);
    }
  }
}

/**
 * TorchMgr is a manager class to manage the instances of the Frame class and
 * the Map class, it also perform as a global controller which hold on global
 * static variables and utility methods.
 */
function TorchMgr() {}

TorchMgr.SITE_URL = 'http://googlemaps.github.io/js-v2-samples/torchrelay/maps';
TorchMgr.TORCH_DATA_URL = TorchMgr.SITE_URL + "/data/torchRelayJSON-" + determineLocale() + ".json";
TorchMgr.CITY_IMAGE_DATA_URL = TorchMgr.SITE_URL + "/data/photolinks.json";
TorchMgr.IMAGES_PATH = "/images/";
TorchMgr.LOG = false;

//TODO: Modify to zero-index?
TorchMgr.TYPE_WORLD_CITY = "w";
TorchMgr.TYPE_CHINA_PROVINCE = "cp";
TorchMgr.TYPE_CHINA_CITY = "c";

TorchMgr.CHINA_LIST_START_INDEX = 21;
TorchMgr.CHINA_LIST_END_INDEX = 135;

TorchMgr.STATUS_TORCHED = 1;
TorchMgr.STATUS_NOTORCH = 2;
TorchMgr.REGION_WORLD = 1;
TorchMgr.REGION_CHINA = 2;
TorchMgr.EVENT_FROM_MAP = 1;
TorchMgr.EVENT_FROM_FRAME = 2;
TorchMgr.AUTO_SCROLL_UP = 1;
TorchMgr.AUTO_SCROLL_DOWN = 2;

TorchMgr.frame = new Frame();
//TorchMgr.map = new Map();
TorchMgr.worldCityList = null;
TorchMgr.chinaCityList = null;
TorchMgr.chinaProvinceList = null;
TorchMgr.worldDefaultCity = null;
TorchMgr.chinaDefaultCity = null;
TorchMgr.torchCity = null;
TorchMgr.currentRegion = -1;
TorchMgr.currentCity = null;
TorchMgr.playerIntervalId = null;
TorchMgr.scrollId = null;
TorchMgr.localizedText = null;
TorchMgr.cityImageList = null;
TorchMgr.precachedImage = null;

/**
 * Download the image file into browser cache before we reference it.
 */
TorchMgr.precacheCityImage = function(url) 
{
		var image = new Image();
		if(null != image)
		{
			TorchMgr.Log("Precaching image " + url);
			image.src = url;
			TorchMgr.precachedImage = image;
			//google.maps.Event.addListener(TorchMgr.precachedImage, "onload", func);
			image.onload = function(){
				TorchMgr.Log('onload Fired');
				google.maps.Event.trigger(TorchMgr, "precacheComplete");
			};
		}
}
/**
 * Convience logging function
 */
TorchMgr.Log = function(content){};

/**
 * To change current city and invoke relative method in frame and/or map.
 * @param {String} cityId City's id.
 * @param {int} whereComeFrom Indicate who change city initially.
 */
TorchMgr.setCity = function(city, whereComeFrom) {
  TorchMgr.Log('[TorchMgr.setCity] ' + city.name + ', ' + whereComeFrom);

	TorchMgr.currentCity = city;
  if (whereComeFrom == TorchMgr.EVENT_FROM_FRAME) {
    TorchMgr.map.setCity(city);
  } else if (whereComeFrom == TorchMgr.EVENT_FROM_MAP) {
    TorchMgr.frame.setCity(city);
  } 
}

/**
 * To change current region and invoke relative method in frame and/or map.
 * Only invoked by onclick event from the player's link in browser.
 * @param {String} id The 'a' tag's id of the player in browser.
 */
TorchMgr.changeRegion = function(id) {
  var worldLink = document.getElementById('worldLink');
  var chinaLink = document.getElementById('chinaLink');
  
  TorchMgr.Log('[TorchMgr.changeRegion] ' + id);
  var region = null;
  if (id == "worldLink") {
  	worldLink.className = "selected";
  	chinaLink.className = ""; 
    region = TorchMgr.REGION_WORLD;
  } else if (id == "chinaLink") {
    worldLink.className = "";
    chinaLink.className = "selected";
    region = TorchMgr.REGION_CHINA;
  }
	TorchMgr.currentRegion = region;
  TorchMgr.map.setRegion(region);
  TorchMgr.frame.setRegion(region);
  TorchMgr.currentCity = (region == TorchMgr.REGION_WORLD) ? TorchMgr.worldDefaultCity : TorchMgr.chinaDefaultCity;
}

/**
 * To set the current region, invoked by the map currently.
 * @param {int} region
 * @param {int} whereComeFrom Indicate who change city initially.
 */
TorchMgr.setRegion = function(region, whereComeFrom){
  TorchMgr.Log('[TorchMgr.setRegion] ' + region + ', ' + whereComeFrom);

	TorchMgr.currentRegion = region;
	if (whereComeFrom == TorchMgr.EVENT_FROM_FRAME) {
    TorchMgr.map.setRegion(region);
  } else if (whereComeFrom == TorchMgr.EVENT_FROM_MAP) {
    TorchMgr.frame.setRegion(region);
  }
  TorchMgr.currentCity = (region == TorchMgr.REGION_WORLD) ? TorchMgr.worldDefaultCity : TorchMgr.chinaDefaultCity;
}

/**
 * A help method of city player.
 * @param {int} isAscend Flag to determine which direction player should go.
 *              o:ascend; 1:descend.
 */
TorchMgr.toNext = function(isAscend) {
  var cityList = (TorchMgr.currentRegion == TorchMgr.REGION_WORLD) ? TorchMgr.worldCityList : TorchMgr.chinaCityList;
  var cityIndex;
  if(TorchMgr.currentCity.id.search(/^cp/) == 0) {
    // TODO: If current city is province, toNext is still to the next province
    // or its first city? Now implement is to the province's first city.
    var firstCity = document.getElementById(TorchMgr.currentCity.id).nextSibling.firstChild;
    cityIndex = parseInt(firstCity.id.match(/\d+/));
  }else{
    cityIndex = parseInt(TorchMgr.currentCity.id.match(/\d+/));
  }
  var offset = (TorchMgr.currentRegion == TorchMgr.REGION_WORLD) ? 0 : TorchMgr.CHINA_LIST_START_INDEX;
  var nextCity = isAscend ? cityList[cityIndex - offset + 1] : cityList[cityIndex - offset - 1];
  if (nextCity) {
    TorchMgr.currentCity = nextCity;
    TorchMgr.map.setCity(nextCity);
    TorchMgr.frame.setCity(nextCity);
  }
}

/**
 * A help method to transform Date object to locale string, now only for
 * Chinese. However, it can be extended for i18n if necessary.
 * @param {Object} date
 */
TorchMgr.toZhDate = function(date) {
  var localDate;
  
  if (date.indexOf("-") != -1) {
    var dateArray = date.split("-");
    localDate = (new Date(dateArray[0])).toLocaleDateString().substr(5, 6) +
                 "-" +
                 (new Date(dateArray[1])).toLocaleDateString().substr(5, 6);
  } else {
    localDate = (new Date(date)).toLocaleDateString().substr(5, 6);
  }

  return localDate;
}

TorchMgr.toLocaleDate = function(date) {
  var localDate;
  switch(TorchMgr.locale)
  {
  	case "en_us":
	case "en_uk":
	case "en_nz":
	case "en_au":
  		return TorchMgr.toEnDate(date);
  	break;
	case "fr_fr":
	case "fr_be":
		return TorchMgr.toFrDate(date);
	break;
  	case "zh_cn":
  		return TorchMgr.toZhDate(date);
  	break;
  	default:
  		return TorchMgr.toWorldDate(date);
  	break;
  }
}

TorchMgr.toEnDate = function(date){
   if (date.indexOf("-") != -1) {
     var dateArray = date.split("-");
     var dateA = new Date(dateArray[0]);
     var dateB = new Date(dateArray[1]);
     localDate = (dateA.getMonth() + 1) + "/" +  dateA.getDate() + "/" + dateA.getFullYear() +
                  "-" +
                  (dateB.getMonth() + 1) + "/" + dateB.getDate() + "/" + dateB.getFullYear();
   } else {
     var dateC = new Date(date);
     localDate = (dateC.getMonth() + 1) + "/" + dateC.getDate() + "/" + dateC.getFullYear()
   }
   return localDate;
}

TorchMgr.toEnLocaleDate = function(date){
  if (date.indexOf("-") != -1) {
    var dateArray = date.split("-");
    localDate = (new Date(dateArray[0])).toLocaleDateString() +
                 "-" +
                 (new Date(dateArray[1])).toLocaleDateString();
  } else {
    localDate = (new Date(date)).toLocaleDateString();
  }

  return localDate;

}

TorchMgr.toFrDate = function(date){
	var months = [	"Janvier", 	"Février", 	"Mars", 
					"Avril", 	"Mai", 		"Juin", 
					"Juillet", 	"Août", 	"Septembre", 
					"Octobre", 	"Novembre", "Décembre" ];
					
   if (date.indexOf("-") != -1) {
     var dateArray = date.split("-");
     var dateA = new Date(dateArray[0]);
     var dateB = new Date(dateArray[1]);
     localDate = dateA.getDate() + " " +months[dateA.getMonth()] + ", " + dateA.getFullYear() +
                  "-" +
                  dateB.getDate() + " " + months[dateB.getMonth()] + ", " + dateB.getFullYear();
   } else {
     var dateC = new Date(date);
     localDate = dateC.getDate() + " " + months[dateC.getMonth()] + ", " + dateC.getFullYear()
   }
   return localDate;
}

TorchMgr.toWorldDate = function(date){
   if (date.indexOf("-") != -1) {
     var dateArray = date.split("-");
     var dateA = new Date(dateArray[0]);
     var dateB = new Date(dateArray[1]);
     localDate = dateA.getDate() + "/" + (dateA.getMonth() + 1) + "/" + dateA.getFullYear() +
                  "-" +
                  dateB.getDate() + "/" + (dateB.getMonth() + 1) + "/" + dateB.getFullYear();
   } else {
     var dateC = new Date(date);
     localDate = dateC.getDate() + "/" + (dateC.getMonth() + 1) + "/" + dateC.getFullYear()
   }
   return localDate;
}

TorchMgr.autoScroll = function(direction){
  var topParent = document.getElementById("scrollWindow");
  if(direction == TorchMgr.AUTO_SCROLL_UP){
    topParent.scrollTop = topParent.scrollTop-20;
  }else if(direction == TorchMgr.AUTO_SCROLL_DOWN){
    topParent.scrollTop = topParent.scrollTop+20;
  }
}

TorchMgr.startScroll = function(direction){
	TorchMgr.autoScroll(direction);
	TorchMgr.scrollId = setInterval("TorchMgr.autoScroll("+direction+");", 500);
} 
TorchMgr.stopScroll = function(){
	clearInterval(TorchMgr.scrollId);
  TorchMgr.scrollId == null;
} 

/**
 * A help method to get the city by its id.
 * @param {String} cityId
 */
TorchMgr.getCityById = function(cityId) {
  var city = null;
  var cityIndex = parseInt(cityId.match(/\d+/));
  // Get the city first
  if (cityId.search(/^w/) == 0) {
    city = TorchMgr.worldCityList[cityIndex];
  } else {
    if (cityId.search(/^cp/) == 0) {
      city = TorchMgr.chinaProvinceList[cityIndex];
    } else {
      city = TorchMgr.chinaCityList[cityIndex-TorchMgr.CHINA_LIST_START_INDEX];
    }
  }
	return city;
}

/**
 * The entrance of the whole, fired by the onload method of Google Gadget.
 */
TorchMgr.start = function(mapDiv,locale,date) {
  
  /**
   * Get city from array and add it with its status into the frame and the map.
   * @param {Array} cityListArray Array of city list.
   * @param {int} opt_status The status of all cities should be. If not been
   *                         given, use torch city as a point to determine the
   *                         city's status.
   */
  function loadCities(cityListArray, opt_status) {
    /**
     * Inner function of loadCities(). Can't change the import sequence.
     */
    function importCity(cityList, startIndex, endIndex, cityStatus, cityType) {
			TorchMgr.frame.importCity(cityList, startIndex, endIndex, cityStatus, cityType);
			TorchMgr.map.importCity(cityList, startIndex, endIndex, cityStatus, cityType);
    }

    // loadCities() start execute
    if (cityListArray.length == 1) {  // World
      var cityList = cityListArray[0];
      if (opt_status) {
        importCity(cityList, 0, cityList.length - 1, opt_status, TorchMgr.TYPE_WORLD_CITY);
      } else {
        var cityIndex = parseInt(TorchMgr.torchCity.index);
        importCity(cityList, 0, cityIndex, TorchMgr.STATUS_TORCHED, TorchMgr.TYPE_WORLD_CITY);
        importCity(cityList, cityIndex + 1, cityList.length - 1, TorchMgr.STATUS_NOTORCH, TorchMgr.TYPE_WORLD_CITY);
      }
    } else if(cityListArray.length == 2){  // China
      var cityList = cityListArray[0];
      var provinceList = cityListArray[1];
      if (opt_status) {
        importCity(provinceList, 0, provinceList.length - 1, opt_status, TorchMgr.TYPE_CHINA_PROVINCE);
        importCity(cityList, 0, cityList.length - 1, opt_status, TorchMgr.TYPE_CHINA_CITY);
      } else {
        var cityIndex = parseInt(TorchMgr.torchCity.index);
        var provinceIndex = parseInt(TorchMgr.torchCity.prtIndex);
        importCity(provinceList, 0, provinceIndex, TorchMgr.STATUS_TORCHED, TorchMgr.TYPE_CHINA_PROVINCE);
        importCity(provinceList, provinceIndex + 1, provinceList.length - 1, TorchMgr.STATUS_NOTORCH, TorchMgr.TYPE_CHINA_PROVINCE);
        importCity(cityList, 0, cityIndex - TorchMgr.CHINA_LIST_START_INDEX, TorchMgr.STATUS_TORCHED, TorchMgr.TYPE_CHINA_CITY);
        importCity(cityList, cityIndex - TorchMgr.CHINA_LIST_START_INDEX + 1, cityList.length - 1, TorchMgr.STATUS_NOTORCH, TorchMgr.TYPE_CHINA_CITY);
      }
    }
  }

  /**
   * Find the city where the torch should be currently.
   * Note - this assumes no overlap in yyyy/mm/dd - yyyy/mm/dd range specified in data.
   *      - Should always return previous item until 'today' passes next item in list.
   * @param {Array} cityList Array of cities.
   * @param {Date} now Current date object.
   */
  function findTorchCity(cityList, now) {
    /**
     * Inner function of findTorchCity(). Find torch city using binary search.
     */
    function quickSearch(today, beginIndex, endIndex, cityList) {

      var middleIndex = Math.floor((endIndex + beginIndex) / 2);
      TorchMgr.Log('quickSearch(' + [today,beginIndex,endIndex].join(',') + ', ...) Middle index: ' + middleIndex);
      var city = cityList[middleIndex];
      var nextCity = cityList[middleIndex+1];
      var cityDate = city.date;
      var cityDays = cityDate.replace(/(\d{4})\/(\d{2})\/(\d{2})/g, "$1$2$3").match(/\d{8}/g);
      var nextCityDate = nextCity.date;
      var nextCityDays = nextCityDate.replace(/(\d{4})\/(\d{2})\/(\d{2})/g, "$1$2$3").match(/\d{8}/g);
      // The city date format is '****/**/**' or '****/**/** - ****/**/**'. So
      // cityDays[0] is the numbers of the city date or the date before '-', and
      // cityDays[1] might be exist as the numbers of the date after '-'.
      if (beginIndex == endIndex) {
      	// We should terminate recursion, but decision still remains.
		cityDate = cityList[beginIndex].date;
      	cityDays = cityDate.replace(/(\d{4})\/(\d{2})\/(\d{2})/g, "$1$2$3").match(/\d{8}/g);
      	if(today >= cityDays[0])
      	{
      		return cityList[beginIndex];
	        TorchMgr.Log('quickSearch =' + beginIndex);
      	}
      	else
      	{
      		return cityList[beginIndex-1];
	        TorchMgr.Log('quickSearch =' + beginIndex-1);      		
      	}
      } else if (today < cityDays[0] && middleIndex > beginIndex) {
        return quickSearch(today, beginIndex, --middleIndex, cityList);
      } else if ((cityDays[1] && (today > cityDays[1] && middleIndex < endIndex))) {
        return quickSearch(today, ++middleIndex, endIndex, cityList);
      } else if ((!cityDays[1] && (today > cityDays[0] && today >= nextCityDays[0] && middleIndex < endIndex))){
      	return quickSearch(today, ++middleIndex, endIndex, cityList);
      } else {
        TorchMgr.Log('quickSearch =' + middleIndex);
        return cityList[middleIndex];
      }
    }
    
    // findTorchCity() start.
		var startDate = new Date(Date.UTC(2008, 3 - 1, 24, 0 - 8, 0, 0, 0)); 
		var endDate = new Date(Date.UTC(2008, 8 - 1, 8, 24 - 8, 0, 0, 0)); 
		if(now.getTime()<startDate.getTime() || now.getTime() > endDate.getTime()){
			return null;
		}
		
    var month = now.getMonth() + 1;  // getMonth() is start from 0.
    var date = now.getDate();
    var today = now.getFullYear() + (month < 10 ? "0" + month : month)
        + (date < 10 ? "0" + date : date); 
    return quickSearch(today, 0, cityList.length - 1, cityList);
  }

  //TorchMgr.start() start execute.
  TorchMgr.map = new Map(mapDiv);
  TorchMgr.locale = locale;
  
  var now;
  
    if(null != date)
    {
    	now = new Date(date);
    }
    else
    {
    	now = new Date();
    }
    
    TorchMgr.Log("Current Date: " + now);
	
  // Beijing Time:2008.05.04 00:00
  var dateMileStone = new Date(Date.UTC(2008, 5 - 1, 4, 0 - 8, 0, 0, 0)); 
  TorchMgr.Log("Milestone Date: " + dateMileStone);
  TorchMgr.currentRegion = ((dateMileStone.getTime() - now.getTime()) > 0) ? TorchMgr.REGION_WORLD : TorchMgr.REGION_CHINA;
  TorchMgr.Log('Initial region: ' + TorchMgr.currentRegion);
	// Support for Google Maps API
	// Get image data first.
	//google.maps.DownloadUrl(TorchMgr.CITY_IMAGE_DATA_URL, function(data){
	getCityImagesJson(TorchMgr.CITY_IMAGE_DATA_URL, function(data){
  		var imageData = eval(data);
  		TorchMgr.cityImageList = imageData;
   	});
  	
  	// Fetch localized langage data next.
	//google.maps.DownloadUrl(TorchMgr.TORCH_DATA_URL,function(data){
	//	_IG_FetchContent(TorchMgr.TORCH_DATA_URL, function(data){
	getCityListJson(TorchMgr.TORCH_DATA_URL, function(data) {
    var torchDataList = eval(data);
    
    // Hard-coded region lists 
    TorchMgr.worldCityList = torchDataList[0].worldCityList;
	TorchMgr.chinaProvinceList = torchDataList[1].chinaProvList;
    TorchMgr.chinaCityList = torchDataList[2].chinaCityList;
    TorchMgr.localizedText = (torchDataList[3] ? torchDataList[3].localizedText : null);
    TorchMgr.localizedContainerText = (torchDataList[4] ? torchDataList[4].localizedContainerText : null);
    
    // Begin load data and display
    if (TorchMgr.currentRegion == TorchMgr.REGION_WORLD) { // Display world view by default
      TorchMgr.torchCity = findTorchCity(TorchMgr.worldCityList, now);
			if(TorchMgr.torchCity){
				TorchMgr.currentCity= TorchMgr.worldDefaultCity = TorchMgr.torchCity;
				loadCities([TorchMgr.worldCityList]);
			}else{
				TorchMgr.currentCity= TorchMgr.worldDefaultCity = TorchMgr.worldCityList[0];
				loadCities([TorchMgr.worldCityList], TorchMgr.STATUS_NOTORCH);
			}
      TorchMgr.chinaDefaultCity = TorchMgr.chinaCityList[0];
      loadCities([TorchMgr.chinaCityList, TorchMgr.chinaProvinceList], TorchMgr.STATUS_NOTORCH);
    } else { // Display China view by default, same logic as above
      TorchMgr.torchCity = findTorchCity(TorchMgr.chinaCityList, now);
      if(TorchMgr.torchCity){
        TorchMgr.currentCity= TorchMgr.chinaDefaultCity = TorchMgr.torchCity;
				loadCities([TorchMgr.chinaCityList, TorchMgr.chinaProvinceList]);
      }else{
        TorchMgr.currentCity= TorchMgr.chinaDefaultCity = TorchMgr.chinaCityList[0];
				loadCities([TorchMgr.chinaCityList, TorchMgr.chinaProvinceList], TorchMgr.STATUS_TORCHED);
      }
      TorchMgr.worldDefaultCity = TorchMgr.worldCityList[0];
      loadCities([TorchMgr.worldCityList], TorchMgr.STATUS_TORCHED);
    }
	TorchMgr.frame.init(TorchMgr.currentRegion);
    TorchMgr.map.init(TorchMgr.currentRegion);
    
    localizeContainer(TorchMgr.localizedContainerText);
    
  });
}
/**
 * All begin from here, it invoke the TorchMgr.start() method.
 */
// Used to support Mapplet API
//_IG_RegisterOnloadHandler(TorchMgr.start);

/**
 * Generic initialize function to execute when API is ready
 */
function initialize()
{
	var mapDiv = document.getElementById('torchMap');
	var locale = determineLocale();
	var date   = determineDate();
	TorchMgr.Log('Query: ' + document.location.search);
	TorchMgr.Log('Locale: ' + determineLocale());
	TorchMgr.Log('Language: ' + determineLanguage());
	TorchMgr.Log('Date: ' + determineDate());
	
	document.body.onresize = function() {
	   resizeApp();
	};
	
	document.body.onunload = function() {
	   google.maps.Unload();
	};
	
	window.onresize = function() {
	   resizeApp();
	};
	
	window.onunload = function() {
	   google.maps.Unload();
	};
	
	resizeApp();
	if(!mapDiv)
	{
		throw new Error("Unable to get map div");
	}
	else
	{
		TorchMgr.start(mapDiv, locale,date);
	}

	TorchMgr.Log = function(content)
	{
		if(TorchMgr.LOG)
		{
			google.maps.Log.write(content);
		}
	}
	
}

function getCityListJson(url, callback){
    city_list = function(data)
   {
      delete city_list;
      callback(data);
   }
   
   var script = document.createElement("script");
   script.src = url;
   document.body.appendChild(script);
   
}

function getCityImagesJson(url, callback){
    city_images = function(data)
   {
      delete city_images;
      callback(data);
   }
   
   var script = document.createElement("script");
   script.src = url;
   document.body.appendChild(script);
   
}

/**
 * Borrow javascript from Google Maps to support application height/width comprehension.
 */
function getWindowHeight() {
	if (window.self && self.innerHeight) {
		return self.innerHeight;
	}
	if (document.documentElement && document.documentElement.clientHeight) {
		return document.documentElement.clientHeight;
	}
	return 0;
}
/**
 * Borrow javascript from Google Maps to support application height/width comprehension.
 */

function getWindowWidth() {
	if (window.self && self.innerWidth) {
		return self.innerWidth;
	}
	if (document.documentElement && document.documentElement.clientWidth) {
		return document.documentElement.clientWidth;
	}
	return 0;
}

/**
 * Called to resize both map and frame windows when browser window has changed size.
 */
function resizeApp()
{
   /* No need to resize app in iFrame
	var TOP_OFFSET = 205;      // Top of container
	var BOTTOM_OFFSET = 40;    // Bottom of container
	var BUTTON_OFFSET = 20;    // offset for frame buttons (necessary, despite buttons have been moved)
	var FRAME_OFFSET = 22;     // offset to line-up frame bottom to map
	var RIGHT_OFFSET = 330;    // offset from right side
	var PADDING = 10;          // Overall container padding
	
	var height = getWindowHeight() - PADDING;
	var width = getWindowWidth() - PADDING;
	
	var mapWidth = width - RIGHT_OFFSET;
	var mapHeight = height - TOP_OFFSET - BOTTOM_OFFSET;
	
	var container = document.getElementById('container');
	var map = document.getElementById('torchMap');
	var frame = document.getElementById('torchFrame');
	var scrollWindow = document.getElementById('scrollWindow');
	var scrollWrapper = document.getElementById('scrollWrapper');
	container.style.height = mapHeight + "px";
	map.style.width = mapWidth + "px";
	map.style.height = mapHeight + "px";
		
	scrollWindow.style.height = (mapHeight - FRAME_OFFSET - BUTTON_OFFSET) + "px";
	scrollWrapper.style.height = (mapHeight - FRAME_OFFSET) + "px";
   */
}

/**
 * The localize container function ensures the DOM contains localized text from JSON file.
 */
function localizeContainer(data)
{
   /* Page to be localized by Google container
	var container = document.getElementById('container');
	var title = document.getElementById('title');
	var preamble = document.getElementById('preamble');
	var ge_link = document.getElementById('ge_link');
	var attribution = document.getElementById('attribution');
	
	document.title = data.title;
	title.innerHTML = data.title;
	preamble.innerHTML = "<h4>" + data.header + "</h4><p>" + data.body + "</p>";
	ge_link.innerHTML = data.ge_link;
	attribution.innerHTML = data.attribution;	
	*/
}

TorchMgr.Log("Locale: " + determineLocale() + ", Language: " + determineLanguage());

// Kickstart everything
google.setOnLoadCallback(initialize);
google.load("maps", "2", {locale:determineLanguage()});