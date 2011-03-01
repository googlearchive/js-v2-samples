var map;
var defaultWidth = currentWidth = "500";
var defaultHeight = currentHeight = "400";
var defaultCenter = currentCenter = new google.maps.LatLng(0, 0);
var defaultZoom = currentZoom = 1;

var layer;
var defaultTableId = currentTableId = "";
var defaultLocationColumn = currentLocationColumn = ""
var defaultTextQueryLabel = currentTextQueryLabel = "";
var defaultTextQueryColumn = currentTextQueryColumn = "";
var defaultSelectQueryLabel = currentSelectQueryLabel = "";
var defaultSelectQueryColumn = currentSelectQueryColumn = "";
var selectOptions = "";

var queryAdded = false;
var selectQueryAdded = false;

function initialize() {
	document.getElementById('map_canvas').style.width = defaultWidth + "px";
	document.getElementById('map_canvas').style.height = defaultHeight + "px";

	map = new google.maps.Map(document.getElementById('map_canvas'), {
		center: defaultCenter,
		zoom: defaultZoom, //zoom
		mapTypeId: google.maps.MapTypeId.ROADMAP //the map style
	});
}

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
	});
}

function addLayer() {
  if(!checkLayerForm()) return;
  
  currentTableId = document.getElementById('tableid').value ?
 		document.getElementById('tableid').value : defaultTableId;
  currentLocationColumn = document.getElementById('locationColumn').value ?
 		document.getElementById('locationColumn').value : defaultLocationColumn;

 	
	addLayerToMap();
	updateTextArea();
}

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

function addLayerToMap() {
	if(layer) layer.setMap(null); 
	layer = new google.maps.FusionTablesLayer(parseInt(currentTableId));
	layer.setQuery("SELECT " + currentLocationColumn + " FROM " + currentTableId);
	layer.setMap(map);
}

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
	
	query = "SELECT%20'" + document.getElementById('selectQueryColumn').value + "',COUNT()%20FROM%20" + currentTableId + " GROUP BY '" + document.getElementById('selectQueryColumn').value + "'";
	var script = document.createElement("script");
	script.setAttribute("src", "https://www.google.com/fusiontables/api/query?sql=" + query + "&jsonCallback=selectData");
	document.body.appendChild(script);
}

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

function removeChildren(menu) {
	if(menu.hasChildNodes()) {
    while (menu.childNodes.length > 2) {
      menu.removeChild(menu.lastChild);       
    } 
  }
}

function disableSelectMenus() {
	document.getElementById('locationColumn').disabled = true;
	document.getElementById('textQueryColumn').disabled = true;
}

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
			"  layer.setQuery(\"SELECT '" + currentLocationColumn + "' FROM \" + tableid + \" WHERE '" + currentTextQueryColumn + "' = '\" + document.getElementById('searchString').value + \"'\");\n" +
			"}\n";
	}
	
	if(currentSelectQueryLabel) {
		textArea +=
			"\n" +
			"function changeMap() {\n" +
			"  layer.setQuery(\"SELECT '" + currentLocationColumn + "' FROM \" + tableid + \" WHERE '" + currentSelectQueryColumn + "' LIKE '\" + document.getElementById('searchString').value + \"'\");\n" +
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

function textQueryChangeMap() {
	layer.setQuery("SELECT '" + currentLocationColumn + 
		"' FROM " + currentTableId + 
		" WHERE '" + currentTextQueryColumn + "' = '" + document.getElementById('textSearch').value + "'");
}

function selectQueryChangeMap() {
	layer.setQuery("SELECT '" + currentLocationColumn + 
		"' FROM " + currentTableId + 
		" WHERE '" + currentSelectQueryColumn + "' LIKE '" + document.getElementById('selectSearch').value + "'");
}

function showDiv(which) {
  var other = new Array();
  other['text'] = 'select';
  other['select'] = 'text';
  document.getElementById(which).style.display = "block";
  document.getElementById("query" + which).className = "selected";
  document.getElementById(other[which]).style.display = "none";
  document.getElementById("query" + other[which]).className = "notselected";
}



