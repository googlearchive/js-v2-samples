<?php

require_once 'communitymap_globals.php';

$session = $_GET['session'];

$gdClient = setupClient();

$listFeed = getWkshtListFeed($gdClient, SPREADSHEET_KEY, USER_WORKSHEET_ID, ('session='.$session));

if ( count($listFeed->entries) > 0) {
  $row = $listFeed->entries[0];
  $rowData = $row->getCustom();
  foreach($rowData as $customEntry) {
    if ($customEntry->getColumnName()=="user") {
      $user = $customEntry->getText();
    }
  }

  $place = $_GET['place'];
  $lat = $_GET['lat'];
  $lng = $_GET['lng'];
  $rowArray["user"] = $user;
  $rowArray["place"] = $place;
  $rowArray["lat"] = $lat;
  $rowArray["lng"] = $lng;
  $rowArray["date"] = date("F j, Y, g:i a");
  $entry = $gdClient->insertRow($rowArray, SPREADSHEET_KEY, LOC_WORKSHEET_ID);
  if ($entry instanceof Zend_Gdata_Spreadsheets_ListEntry) {
    echo "Success!\n";
  }
}

?>
