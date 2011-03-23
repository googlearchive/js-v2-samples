var map;

var defaultWidth = currentWidth = "500";
var defaultHeight = currentHeight = "400";
var defaultCenter = currentCenter = new google.maps.LatLng(0, 0);
var defaultZoom = currentZoom = 1;

var layer;
var anotherLayer;

var defaultTableId = currentTableId = "";
var defaultLocationColumn = currentLocationColumn = "";
var defaultFilter = currentFilter = "";
var defaultAnotherTableId = currentAnotherTableId = "";
var defaultAnotherLocationColumn = currentAnotherLocationColumn = "";
var defaultAnotherFilter = currentAnotherFilter = "";

var defaultTextQueryLabel = currentTextQueryLabel = "";
var defaultTextQueryColumn = currentTextQueryColumn = "";
var defaultSelectQueryLabel = currentSelectQueryLabel = "";
var defaultSelectQueryColumn = currentSelectQueryColumn = "";

var selectOptions = "";

var queryAdded = false;
var selectQueryAdded = false;
var lastDisplayed = "";

/*** Form Functionality ***/

//show defaults in text boxes
function initialize() {
  document.getElementById('mapwidth').value = defaultWidth;
  document.getElementById('mapheight').value = defaultHeight;
  document.getElementById('mapCenter').value = defaultCenter.lat() + ", " + defaultCenter.lng();
  document.getElementById('mapZoom').value = defaultZoom;
}

//edit the map based on user-entered values
function editMap() {

	//map values
  currentWidth = document.getElementById('mapwidth').value ? 
  	parseInt(document.getElementById('mapwidth').value) : defaultWidth;
  currentHeight = document.getElementById('mapheight').value ? 
  	parseInt(document.getElementById('mapheight').value) : defaultHeight;
  currentZoom = document.getElementById('mapZoom').value ? 
  	parseInt(document.getElementById('mapZoom').value) : defaultZoom;
	
	document.getElementById('map_canvas').style.width = currentWidth + "px";
	document.getElementById('map_canvas').style.height = currentHeight + "px";

	geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': document.getElementById("mapCenter").value }, function(results, status) {
		currentCenter = defaultCenter;
		if (status == google.maps.GeocoderStatus.OK) {
			currentCenter = results[0].geometry.location;
		}
		map = new google.maps.Map(document.getElementById('map_canvas'), {
			center: currentCenter,
			zoom: currentZoom, //zoom
			mapTypeId: google.maps.MapTypeId.ROADMAP //the map style
		});
		updateTextArea();
		if(currentTableId && currentLocationColumn) addLayerToMap();
		if(currentAnotherTableId && currentAnotherLocationColumn) addAnotherLayerToMap();
	});
}

//fill the select columns in the form after user enters table id
function fillSelectColumns() {
	selectMenu1 = document.getElementById('locationColumn');
	selectMenu2 = document.getElementById('textQueryColumn');
	selectMenu3 = document.getElementById('selectQueryColumn');
	removeChildren(selectMenu1);
	removeChildren(selectMenu2);
	removeChildren(selectMenu3);
	
	query = "SELECT%20*%20FROM%20" + document.getElementById('tableid').value + "%20LIMIT%201";
	var script = document.createElement("script");
	script.setAttribute("src", "https://www.google.com/fusiontables/api/query?sql=" + query + "&jsonCallback=selectColumns");
	document.body.appendChild(script);
}

//actually add the columns from the table to the select columns in the form
function selectColumns(response) {
	selectMenu1 = document.getElementById('locationColumn');
	selectMenu2 = document.getElementById('textQueryColumn');
	selectMenu3 = document.getElementById('selectQueryColumn');
	for(key in response['table']['cols']) {
		option1 = document.createElement("option");
		option1.setAttribute("value", response['table']['cols'][key]);
		option1.innerHTML = response['table']['cols'][key];
		option2 = document.createElement("option");
		option2.setAttribute("value", response['table']['cols'][key]);
		option2.innerHTML = response['table']['cols'][key];
		option3 = document.createElement("option");
		option3.setAttribute("value", response['table']['cols'][key]);
		option3.innerHTML = response['table']['cols'][key];
		selectMenu1.appendChild(option1);
		selectMenu2.appendChild(option2);
		selectMenu3.appendChild(option3);
	}
	selectMenu1.disabled = false;
	selectMenu2.disabled = false;
	selectMenu3.disabled = false;
}


//start adding the layer to the map, button click add layer
function addLayer() {
  if(!checkLayerForm()) return;
  
  currentTableId = document.getElementById('tableid').value ?
 		document.getElementById('tableid').value : defaultTableId;
  currentLocationColumn = document.getElementById('locationColumn').value ?
 		document.getElementById('locationColumn').value : defaultLocationColumn;
 	currentFilter = document.getElementById('filter').value ?
 		document.getElementById('filter').value : defaultFilter;
 	
	addLayerToMap();
	updateTextArea();
}

/*** EXTRA FEATURES ***/

//fill the select columns in the form after user enters table id
function fillAnotherSelectColumns() {
	selectMenu = document.getElementById('anotherLocationColumn');
	removeChildren(selectMenu);
	
	query = "SELECT%20*%20FROM%20" + document.getElementById('anotherTableid').value + "%20LIMIT%201";
	var script = document.createElement("script");
	script.setAttribute("src", "https://www.google.com/fusiontables/api/query?sql=" + query + "&jsonCallback=anotherSelectColumns");
	document.body.appendChild(script);
}


//actually add the columns from the table to the select columns in the form
function anotherSelectColumns(response) {
	selectMenu = document.getElementById('anotherLocationColumn');
	for(key in response['table']['cols']) {
		option = document.createElement("option");
		option.setAttribute("value", response['table']['cols'][key]);
		option.innerHTML = response['table']['cols'][key];
		selectMenu.appendChild(option);
	}
	selectMenu.disabled = false;
}

//start adding the layer to the map, button click add layer
function addAnotherLayer() {
  if(!checkAnotherLayerForm()) return;
  
  currentAnotherTableId = document.getElementById('anotherTableid').value ?
 		document.getElementById('anotherTableid').value : defaultAnotherTableId;
  currentAnotherLocationColumn = document.getElementById('anotherLocationColumn').value ?
 		document.getElementById('anotherLocationColumn').value : defaultAnotherLocationColumn;
 	currentAnotherFilter = document.getElementById('anotherFilter').value ?
 	  document.getElementById('anotherFilter').value : defaultAnotherFilter;
 	
	addAnotherLayerToMap();
	updateTextArea();
}


//start adding the text search, button click add text search
function addQuery() {
	if(!checkSearchForm()) return;
 	
	//query values
  currentTextQueryLabel = document.getElementById('textQueryLabel').value ?
 		document.getElementById('textQueryLabel').value : defaultTextQueryLabel;
  currentTextQueryColumn = document.getElementById('textQueryColumn').value ?
 		document.getElementById('textQueryColumn').value : defaultTextQueryColumn;

	if(!queryAdded) {
		addTextQuery();
		updateTextArea();
		queryAdded = true;
	}
}

//start adding select menu under map, button click add select
function addSelectQuery() {
	if(!checkSelectForm()) return;
 	
	//query values
  currentSelectQueryLabel = document.getElementById('selectQueryLabel').value ?
 		document.getElementById('selectQueryLabel').value : defaultSelectQueryLabel;
  currentSelectQueryColumn = document.getElementById('selectQueryColumn').value ?
 		document.getElementById('selectQueryColumn').value : defaultSelectQueryColumn;

	if(!selectQueryAdded) {
		addSelectQueryUnderMap();
		selectQueryAdded = true;
	}
}

//show the correct form (add layer, select or text query)
function showDiv(which) {
  document.getElementById(which).style.display = "block";
  if(lastDisplayed) document.getElementById(lastDisplayed).style.display = "none";
  lastDisplayed = which;
}

/*** FORM CHECKS ***/

//check the layer form
function checkLayerForm() {
 	if(!document.getElementById('tableid').value) {
 		alert("Table ID required!");
 		return false;
 	}
 	
 	if(!document.getElementById('locationColumn').value) {
 		alert("Location Column required!");
 		return false;
 	}
 	
 	return true;
}

//check the layer form
function checkAnotherLayerForm() {
  if(!checkLayerForm()) return false;
  
 	if(!document.getElementById('anotherTableid').value) {
 		alert("Table ID required!");
 		return false;
 	}
 	
 	if(!document.getElementById('anotherLocationColumn').value) {
 		alert("Location Column required!");
 		return false;
 	}
 	
 	return true;
}

//check the text search form
function checkSearchForm(message) { 	
	if(!checkLayerForm()) return false;
 	
 	if(!document.getElementById('textQueryLabel').value) {
 		alert("Label required!");
 		return false;
 	}
 	
 	if(!document.getElementById('textQueryColumn').value) {
 		alert("Query Column required!");
 		return false;
 	}
 	
 	return true;
}

//check the select menu form
function checkSelectForm(message) { 	
	if(!checkLayerForm()) return false;
 	
 	if(!document.getElementById('selectQueryLabel').value) {
 		alert("Label required!");
 		return false;
 	}
 	
 	if(!document.getElementById('selectQueryColumn').value) {
 		alert("Query Column required!");
 		return false;
 	}
 	
 	return true;
}


/*** Preview Generator ***/

//actually add text-based search under map
function addTextQuery() {
	var mapDiv = document.getElementById('map_section');
	var div = document.createElement("div");
	div.style.marginTop = "10px";
	
	var label = document.createElement("label");
	label.innerHTML = currentTextQueryLabel + "&nbsp;";
	
	var input = document.createElement("input");
	input.setAttribute("type", "text");
	input.setAttribute("id", "textSearch");
	
	var button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("onclick", "javascript:textQueryChangeMap();");
	button.setAttribute("value", "Search");
	
	div.appendChild(label);
	div.appendChild(input);
	div.appendChild(button);
	mapDiv.appendChild(div);
}

//actually add select under map
function addSelectQueryUnderMap() {
  var mapDiv = document.getElementById('map_section');
	var div = document.createElement("div");
	div.style.marginTop = "10px";
	
	var label = document.createElement("label");
	label.innerHTML = currentSelectQueryLabel + "&nbsp;";
	
	var select = document.createElement("select");
	select.setAttribute("id", "selectSearch");
	select.setAttribute("disabled", "true");
	select.setAttribute("onchange", "javascript:selectQueryChangeMap();");
	
	var option = document.createElement("option");
	option.setAttribute("value", "%");
	option.innerHTML = "--Select--";
	select.appendChild(option);
	
	div.appendChild(label);
	div.appendChild(select);
	mapDiv.appendChild(div);
	
	if(currentFilter)
	  query = "SELECT%20'" + document.getElementById('selectQueryColumn').value + "',COUNT()%20FROM%20" + currentTableId + 
	    " WHERE " + currentFilter +
	    " GROUP BY '" + document.getElementById('selectQueryColumn').value + "'";
	else
	  query = "SELECT%20'" + document.getElementById('selectQueryColumn').value + "',COUNT()%20FROM%20" + currentTableId + 
	    " GROUP BY '" + document.getElementById('selectQueryColumn').value + "'";
	
	var script = document.createElement("script");
	script.setAttribute("src", "https://www.google.com/fusiontables/api/query?sql=" + query + "&jsonCallback=selectData");
	document.body.appendChild(script);
}

//fill the select menu with data from table
function selectData(response) {
  var selectMenu = document.getElementById('selectSearch');
  selectOptions = "  &lt;select id=\"searchString\" onchange=\"changeMap(this.value);\"&gt;\n"
  selectOptions += "    &lt;option value=\"%\"&gt;--Select--&lt;/option&gt;\n";
  for(var i = 0; i < response['table']['rows'].length; i++) {
    rowValue = response['table']['rows'][i][0];
		option = document.createElement("option");
		option.setAttribute("value", rowValue);
		option.innerHTML = rowValue;
		selectMenu.appendChild(option);
		selectOptions += "    &lt;option value=\"" + rowValue + "\"&gt;" + rowValue + "&lt;/option&gt;\n";
  }
  selectMenu.disabled = false;
  selectOptions += "  &lt;/select&gt;\n";
  updateTextArea();
}

/*** Preview ***/

//initialize the map
function initializeMap() {
	document.getElementById('map_canvas').style.width = defaultWidth + "px";
	document.getElementById('map_canvas').style.height = defaultHeight + "px";

	map = new google.maps.Map(document.getElementById('map_canvas'), {
		center: defaultCenter,
		zoom: defaultZoom, //zoom
		mapTypeId: google.maps.MapTypeId.ROADMAP //the map style
	});
}

//add the layer to the map
function addLayerToMap() {
	if(layer) layer.setMap(null); 
	layer = new google.maps.FusionTablesLayer(parseInt(currentTableId));
	if(currentFilter) layer.setQuery("SELECT '" + currentLocationColumn + "' FROM " + currentTableId + " WHERE " + currentFilter);
	else layer.setQuery("SELECT '" + currentLocationColumn + "' FROM " + currentTableId);
	layer.setMap(map);
}

//add another layer to the map
function addAnotherLayerToMap() {
	if(anotherLayer) anotherLayer.setMap(null); 
	anotherLayer = new google.maps.FusionTablesLayer(parseInt(currentAnotherTableId));
	if(currentAnotherFilter) anotherLayer.setQuery("SELECT '" + currentAnotherLocationColumn + "' FROM " + currentAnotherTableId + " WHERE " + currentAnotherFilter);
	else anotherLayer.setQuery("SELECT '" + currentAnotherLocationColumn + "' FROM " + currentAnotherTableId);
	anotherLayer.setMap(map);
}

//change the map based on query
function textQueryChangeMap() {
  var searchString = document.getElementById('textSearch').value.replace("'", "\\'");
  if(currentFilter)
	  layer.setQuery("SELECT '" + currentLocationColumn + 
		  "' FROM " + currentTableId + 
		  " WHERE '" + currentTextQueryColumn + "' = '" + searchString + "'" +
		  " AND " + currentFilter);
	else
		layer.setQuery("SELECT '" + currentLocationColumn + 
		  "' FROM " + currentTableId + 
		  " WHERE '" + currentTextQueryColumn + "' = '" + searchString + "'");
}

//change the map based on select menu
function selectQueryChangeMap() {
  var searchString = document.getElementById('selectSearch').value.replace("'", "\\'");
  if(currentFilter)
	  layer.setQuery("SELECT '" + currentLocationColumn + 
		  "' FROM " + currentTableId + 
		  " WHERE '" + currentSelectQueryColumn + "' LIKE '" + searchString + "'" +
		  " AND " + currentFilter);
  else
	  layer.setQuery("SELECT '" + currentLocationColumn + 
		  "' FROM " + currentTableId + 
		  " WHERE '" + currentSelectQueryColumn + "' LIKE '" + searchString + "'");
}

/*** HTML CODE - TEXTAREA ***/

function updateTextArea() {
	var textArea =
	  "&lt;!DOCTYPE html&gt;\n" +
		"&lt;html>\n" +
		"&lt;head>\n" +
		"&lt;style>\n" +
		"  body { font-family: Arial, sans-serif; }\n" +
		"  #map_canvas { width: " + currentWidth + "px; height: " + currentHeight + "px; }\n" +
		"&lt;/style>\n\n" +
		
		"&lt;script type=\"text/javascript\" src=\"http://maps.google.com/maps/api/js?sensor=false\">&lt;/script>\n" +
		"&lt;script type=\"text/javascript\">\n" +
		"var map;\n";
			
	if(currentTableId) {
		textArea += 
			"var layer;\n" +
			"var tableid = " + currentTableId + ";\n\n";
	}
			
	textArea += 
		"function initialize() {\n" +
		"  map = new google.maps.Map(document.getElementById('map_canvas'), {\n" +
		"    center: new google.maps.LatLng(" + currentCenter.lat() + ", " + currentCenter.lng() + "),\n" +
		"    zoom: " + currentZoom + ", //zoom\n" +
		"    mapTypeId: google.maps.MapTypeId.ROADMAP //the map style\n" +
		"  });\n\n";
	
	if(currentTableId) {
		textArea += 
			"  layer = new google.maps.FusionTablesLayer(tableid);\n" +
			"  layer.setQuery(\"SELECT '" + currentLocationColumn + "' FROM \" + tableid);\n" +
			"  layer.setMap(map);\n";
	}
	
	textArea += 
		"}\n";
		
	if(currentTextQueryLabel) {
		textArea +=
			"\n" +
			"function changeMap() {\n" +
			"  var searchString = document.getElementById('searchString').value.replace(\"'\", \"\\\\'\");\n" +
			"  layer.setQuery(\"SELECT '" + currentLocationColumn + "' FROM \" + tableid + \" WHERE '" + currentTextQueryColumn + "' = '\" + searchString + \"'\");\n" +
			"}\n";
	}
	
	if(currentSelectQueryLabel) {
		textArea +=
			"\n" +
			"function changeMap() {\n" +
			"  var searchString = document.getElementById('searchString').value.replace(\"'\", \"\\\\'\");\n" +
			"  layer.setQuery(\"SELECT '" + currentLocationColumn + "' FROM \" + tableid + \" WHERE '" + currentSelectQueryColumn + "' LIKE '\" + searchString + \"'\");\n" +
			"}\n";
	}
	
	textArea +=
		"&lt;/script>\n\n" +
		
		"&lt;/head>\n" +
		"&lt;body onload=\"initialize();\">\n\n" +
		
		"&lt;div id=\"map_canvas\">&lt;/div>\n\n";
	
	if(currentTextQueryLabel) {
		textArea += 
		  "&lt;div style=\"margin-top: 10px;\">\n" +
			"  &lt;label>" + currentTextQueryLabel + " &lt;/label>\n" +
			"  &lt;input type=\"text\" id=\"searchString\" />\n" +
			"  &lt;input type=\"button\" onclick=\"changeMap();\" value=\"Search\" />\n" +
			"&lt;\div>\n\n";
	}
	
	if(currentSelectQueryLabel) {
	  textArea += 
		  "&lt;div style=\"margin-top: 10px;\">\n" +
	    "  &lt;label>" + currentSelectQueryLabel + " &lt;/label>\n" +
	    selectOptions +
			"&lt;\div>\n\n";
	}
	
	textArea +=
		"&lt;/body>\n" +
		"&lt;/html>";
		
	document.getElementById('htmlCode').innerHTML = textArea;
}

/*** UTILS ***/

//remove child nodes from a menu
function removeChildren(menu) {
	if(menu.hasChildNodes()) {
    while (menu.childNodes.length > 2) {
      menu.removeChild(menu.lastChild);       
    } 
  }
}
