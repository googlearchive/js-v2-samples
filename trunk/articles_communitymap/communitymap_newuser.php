<?php
 
require_once 'communitymap_globals.php';
 
$username = $_GET['username'];
$password = $_GET['password'];
 
$gdClient = setupClient();
 
$listFeed = getWkshtListFeed($gdClient, SPREADSHEET_KEY, USER_WORKSHEET_ID, ('user='.$username));
$totalResults = $listFeed->totalResults;
if ( $totalResults != "0") {
  // Username already exists
  exit;
}
 
$rowArray["user"] = $username;
$rowArray["password"] = sha1($password);
$rowArray["session"] = "a";
 
$entry = $gdClient->insertRow($rowArray, SPREADSHEET_KEY, USER_WORKSHEET_ID);
if ($entry instanceof Zend_Gdata_Spreadsheets_ListEntry) {
  echo "Success!";
}
?>
