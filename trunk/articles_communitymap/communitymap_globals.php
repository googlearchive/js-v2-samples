<?php
ini_set("include_path", ".:/usr/lib/php:/usr/local/lib/php:../../../library/");
require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata');
Zend_Loader::loadClass('Zend_Gdata_ClientLogin');
Zend_Loader::loadClass('Zend_Gdata_Spreadsheets');
Zend_Loader::loadClass('Zend_Http_Client');

define("SPREADSHEET_KEY", "o16162288751915453340.4016005092390554215");
define("USER_WORKSHEET_ID", "od6");
define("LOC_WORKSHEET_ID", "od7");
 
function setupClient() {
  $email = "your.name@gmail.com";
  $password = "yourPassword";
  $client = Zend_Gdata_ClientLogin::getHttpClient($email, $password,
          Zend_Gdata_Spreadsheets::AUTH_SERVICE_NAME);
  $gdClient = new Zend_Gdata_Spreadsheets($client);
  return $gdClient;
}
 
function getWkshtListFeed($gdClient, $ssKey, $wkshtId, $queryString=null) {
  $query = new Zend_Gdata_Spreadsheets_ListQuery();
  $query->setSpreadsheetKey($ssKey);
  $query->setWorksheetId($wkshtId);
  if ($queryString !== null) {
    $query->setSpreadsheetQuery($queryString);
  }
  $listFeed = $gdClient->getListFeed($query);
  return $listFeed;
}
 
function printFeed($feed)
{
  print "printing feed";
  $i = 0;
  foreach($feed->entries as $entry) {
      if ($entry instanceof Zend_Gdata_Spreadsheets_CellEntry) {
         print $entry->title->text .' '. $entry->content->text . "\n";
      } else if ($entry instanceof Zend_Gdata_Spreadsheets_ListEntry) {
         print $i .' '. $entry->title->text .' '. $entry->content->text . "\n";
      } else {
         print $i .' '. $entry->title->text . "\n";
      }
      $i++;
  }
}
 
?>
