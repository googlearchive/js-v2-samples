var site = "http://bbs.keyhole.com";
var file = "ubb/download.php?Number=50664";
var geoXml = new GGeoXml(site + "/" + file);
map.setCenter(new GLatLng(36.5, -98.7), 4);
map.addOverlay(geoXml);
