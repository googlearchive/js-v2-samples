<?php
require('phpsqlajax_dbinfo.php');

// Opens a connection to a MySQL server
$connection = mysql_connect ($server, $username, $password);

if (!$connection) 
{
   die('Not connected : ' . mysql_error());
}

// Set the active MySQL database
$db_selected = mysql_select_db($database, $connection);

if (!$db_selected) 
{
  die ('Can\'t use db : ' . mysql_error());
}

// Select all the rows in the markers table

$query = " SELECT GROUP_CONCAT(lng, ',', lat, ',', '100' separator ' ') AS coordinates FROM markers WHERE type = 'restaurant';";

$result = mysql_query($query);
if (!$result) 
{
  die('Invalid query: ' . mysql_error());
}

// Start KML file, create parent node
$dom = new DOMDocument('1.0','UTF-8');

//Create the root KML element and append it to the Document
$node = $dom->createElementNS('http://earth.google.com/kml/2.1','kml');
$parNode = $dom->appendChild($node);

//Create a Folder element and append it to the KML element
$fnode = $dom->createElement('Folder');
$folderNode = $parNode->appendChild($fnode);

//Iterate through the MySQL results
$row = @mysql_fetch_assoc($result);

//Create a Placemark and append it to the document
$node = $dom->createElement('Placemark');
$placeNode = $folderNode->appendChild($node);

//Create an id attribute and assign it the value of id column
$placeNode->setAttribute('id','linestring1');

//Create name, description, and address elements and assign them the values of 
//the name, type, and address columns from the results

$nameNode = $dom->createElement('name','My path');
$placeNode->appendChild($nameNode);
$descNode= $dom->createElement('description', 'This is the path that I took through my favorite restaurants in Seattle');
$placeNode->appendChild($descNode);

//Create a LineString element
$lineNode = $dom->createElement('LineString');
$placeNode->appendChild($lineNode);
$exnode = $dom->createElement('extrude', '1');
$lineNode->appendChild($exnode);
$almodenode =$dom->createElement(altitudeMode,'relativeToGround');
$lineNode->appendChild($almodenode);

//Create a coordinates element and give it the value of the lng and lat columns from the results

$coorNode = $dom->createElement('coordinates',$row['coordinates']);
$lineNode->appendChild($coorNode);
$kmlOutput = $dom->saveXML();

//assign the KML headers. 
header('Content-type: application/vnd.google-earth.kml+xml');
echo $kmlOutput;
?>