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
      echo $customEntry->getText();
    }
  }
}
?>
