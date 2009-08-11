<?php
require('phpsqlajax_dbinfo.php');

// Opens a connection to a MySQL server.

$connection = mysql_connect ($server, $username, $password);

if (!$connection) 
{
  die('Not connected : ' . mysql_error());
}
// Sets the active MySQL database.
$db_selected = mysql_select_db($database, $connection);

if (!$db_selected) 
{
  die('Can\'t use db : ' . mysql_error());
}

// Selects all the rows in the markers table.
$query = 'SELECT * FROM markers WHERE 1';
$result = mysql_query($query);

if (!$result) 
{
  die('Invalid query: ' . mysql_error());
}

// Creates the Document.
$dom = new DOMDocument('1.0', 'UTF-8');

// Creates the root KML element and appends it to the root document.
$node = $dom->createElementNS('http://earth.google.com/kml/2.1', 'kml');
$parNode = $dom->appendChild($node);

// Creates a KML Document element and append it to the KML element.
$dnode = $dom->createElement('Document');
$docNode = $parNode->appendChild($dnode);

// Creates the two Style elements, one for restaurant and one for bar, and append the elements to the Document element.
$restStyleNode = $dom->createElement('Style');
$restStyleNode->setAttribute('id', 'restaurantStyle');
$restIconstyleNode = $dom->createElement('IconStyle');
$restIconstyleNode->setAttribute('id', 'restaurantIcon');
$restIconNode = $dom->createElement('Icon');
$restHref = $dom->createElement('href', 'http://maps.google.com/mapfiles/kml/pal2/icon63.png');
$restIconNode->appendChild($restHref);
$restIconstyleNode->appendChild($restIconNode);
$restStyleNode->appendChild($restIconstyleNode);
$docNode->appendChild($restStyleNode);

$barStyleNode = $dom->createElement('Style');
$barStyleNode->setAttribute('id', 'barStyle');
$barIconstyleNode = $dom->createElement('IconStyle');
$barIconstyleNode->setAttribute('id', 'barIcon');
$barIconNode = $dom->createElement('Icon');
$barHref = $dom->createElement('href', 'http://maps.google.com/mapfiles/kml/pal2/icon27.png');
$barIconNode->appendChild($barHref);
$barIconstyleNode->appendChild($barIconNode);
$barStyleNode->appendChild($barIconstyleNode);
$docNode->appendChild($barStyleNode);

// Iterates through the MySQL results, creating one Placemark for each row.
while ($row = @mysql_fetch_assoc($result))
{
  // Creates a Placemark and append it to the Document.

  $node = $dom->createElement('Placemark');
  $placeNode = $docNode->appendChild($node);

  // Creates an id attribute and assign it the value of id column.
  $placeNode->setAttribute('id', 'placemark' . $row['id']);

  // Create name, and description elements and assigns them the values of the name and address columns from the results.
  $nameNode = $dom->createElement('name',htmlentities($row['name']));
  $placeNode->appendChild($nameNode);
  $descNode = $dom->createElement('description', $row['address']);
  $placeNode->appendChild($descNode);
  $styleUrl = $dom->createElement('styleUrl', '#' . $row['type'] . 'Style');
  $placeNode->appendChild($styleUrl);

  // Creates a Point element.
  $pointNode = $dom->createElement('Point');
  $placeNode->appendChild($pointNode);

  // Creates a coordinates element and gives it the value of the lng and lat columns from the results.
  $coorStr = $row['lng'] . ','  . $row['lat'];
  $coorNode = $dom->createElement('coordinates', $coorStr);
  $pointNode->appendChild($coorNode);
}

$kmlOutput = $dom->saveXML();
header('Content-type: application/vnd.google-earth.kml+xml');
echo $kmlOutput;
?>