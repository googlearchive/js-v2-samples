<?php
 
require_once 'communitymap_globals.php';
 
$username = $_POST['username'];
$password = $_POST['password'];
 
$gdClient = setupClient();
 
$listFeed = getWkshtListFeed($gdClient, SPREADSHEET_KEY, USER_WORKSHEET_ID, ('user='.$username));
 
$password_hash = sha1($password);
$row = $listFeed->entries[0];
$rowData = $row->getCustom();
foreach($rowData as $customEntry) {
  if ($customEntry->getColumnName()=="password" && $customEntry->getText()==$password_hash) {
    $updatedRowArray["user"] = $username;
    $updatedRowArray["password"] = sha1($password);
    $updatedRowArray["session"] = md5(uniqid(rand(), true));
    $updatedRow = $gdClient->updateRow($row, $updatedRowArray); 
    if ($updatedRow instanceof Zend_Gdata_Spreadsheets_ListEntry) {
      echo $updatedRowArray["session"];
    }
  }
}
?>
