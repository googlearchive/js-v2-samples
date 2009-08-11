<?php
require('phpsqlajax_dbinfo.php');

// Opens a connection to a MySQL server.
$connection=mysql_connect ($server, $username, $password);
if (!$connection) 
{
  die('Not connected : ' . mysql_error());
}
// Sets the active MySQL database.
$db_selected = mysql_select_db($database, $connection);
if (!$db_selected) 
{
  die ('Can\'t use db : ' . mysql_error());
}

// Selects all the rows in the markers table.
$query = 'SELECT * FROM markers WHERE 1';
$result = mysql_query($query);
if (!$result) 
{
  die('Invalid query: ' . mysql_error());
}

// Creates the Document.
$dom = new domxml_new_doc('1.0');

// Creates the root KML element and appends it to the root document.
$node = $dom->create_element_ns('http://earth.google.com/kml/2.1', 'kml');
$parNode = $dom->append_child($node);

// Creates a KML Document element and append it to the KML element.
$dnode = $dom->create_element('Document');
$docNode = $parNode->append_child($dnode);
 
//Creates the two Style elements, one for restaurant and one for bar, and append the elements to the Document element.
$restStyleNode = $dom->create_element('Style');
$restStyleNode->set_attribute('id', 'restaurantStyle');
$restIconstyleNode = $dom->create_element('IconStyle');
$restIconstyleNode->set_attribute('id', 'restaurantIcon');
$restIconNode = $dom->create_element('Icon');
$restHref = $dom->create_element('href', 'http://maps.google.com/mapfiles/kml/pal2/icon63.png');
$restIconNode->append_child($restHref);
$restIconstyleNode->append_child($restIconNode);
$restStyleNode->append_child($restIconstyleNode);
$docNode->append_child($restStyleNode);
$barStyleNode = $dom->create_element('Style');
$barStyleNode->set_attribute('id', 'barStyle');
$barIconstyleNode = $dom->create_element('IconStyle');
$barIconstyleNode->set_attribute('id', 'barIcon');
$barIconNode = $dom->create_element('Icon');
$barHref = $dom->create_element('href', 'http://maps.google.com/mapfiles/kml/pal2/icon27.png');
$barIconNode->append_child($barHref);
$barIconstyleNode->append_child($barIconNode);
$barStyleNode->append_child($barIconstyleNode);
$docNode->append_child($barStyleNode);

// Iterates through the MySQL results, creating one Placemark for each row.
while ($row = @mysql_fetch_assoc($result))
{
  // Creates a Placemark and append it to the Document.
  $node = $dom->create_element('Placemark');
  $placeNode = $docNode->append_child($node);
  // Creates an id attribute and assign it the value of id column.
  $placeNode->set_attribute('id', 'placemark' . $row['id']);

  // Create name, and description elements and assigns them the values of the name and address columns from the results.
  $nameNode = $dom->create_element('name',htmlentities($row['name']));
  $placeNode->append_child($nameNode);
  $descNode = $dom->  create_element('description', $row['address']);
  $placeNode->append_child($descNode);
  $styleUrl = $dom->create_element('styleUrl', '#' . $row['type'] . 'Style');
  $placeNode->append_child($styleUrl);
 // Creates a Point element.
  $pointNode = $dom->create_element('Point');
  $placeNode->append_child($pointNode);
   
  // Creates a coordinates element and gives it the value of the lng and lat columns from the results.
  $coorStr = $row['lng'] . ','  . $row['lat'];
  $coorNode = $dom->create_element('coordinates', $coorStr);
  $pointNode->append_child($coorNode);
}

$kmlOutput = $dom->dump_mem(TRUE, 'UTF-8');
header('Content-type: application/vnd.google-earth.kml+xml');
echo $kmlOutput;
?>