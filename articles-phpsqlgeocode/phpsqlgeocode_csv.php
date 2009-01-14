<?php
require("phpsqlgeocode_dbinfo.php");

define("MAPS_HOST", "maps.google.com");
define("KEY", "abcdefg");

// Opens a connection to a MySQL server
$connection = mysql_connect("localhost", $username, $password);
if (!$connection) {
  die("Not connected : " . mysql_error());
}

// Set the active MySQL database
$db_selected = mysql_select_db($database, $connection);
if (!$db_selected) {
  die("Can\'t use db : " . mysql_error());
}

// Select all the rows in the markers table
$query = "SELECT * FROM markers2 WHERE 1";
$result = mysql_query($query);
if (!$result) {
  die("Invalid query: " . mysql_error());
}

// Initialize delay in geocode speed
$delay = 0;
$base_url = "http://" . MAPS_HOST . "/maps/geo?output=csv&key=" . KEY;

// Iterate through the rows, geocoding each address
while ($row = @mysql_fetch_assoc($result)) {
  $geocode_pending = true;

  while ($geocode_pending) {
    $address = $row["address"];
    $id = $row["id"];
    $request_url = $base_url . "&q=" . urlencode($address);
    $csv = file_get_contents($request_url) or die("url not loading");

    $csvSplit = split(",", $csv);
    $status = $csvSplit[0];
    $lat = $csvSplit[2];
    $lng = $csvSplit[3];
    if (strcmp($status, "200") == 0) {
      // successful geocode
      $geocode_pending = false;
      $lat = $csvSplit[2];
      $lng = $csvSplit[3];

      $query = sprintf("UPDATE markers2 " .
             " SET lat = '%s', lng = '%s' " .
             " WHERE id = %s LIMIT 1;",
             mysql_real_escape_string($lat),
             mysql_real_escape_string($lng),
             mysql_real_escape_string($id));
      $update_result = mysql_query($query);
      if (!$update_result) {
        die("Invalid query: " . mysql_error());
      }
    } else if (strcmp($status, "620") == 0) {
      // sent geocodes too fast
      $delay += 100000;
    } else {
      // failure to geocode
      $geocode_pending = false;
      echo "Address " . $address . " failed to geocoded. ";
      echo "Received status " . $status . "
\n";
    }
    usleep($delay);
  }
}
?>

