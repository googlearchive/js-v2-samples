map.setCenter(new GLatLng(37.35, 15.18), 8);
var etnaBounds = new GLatLngBounds(
    new GLatLng(37.46543388598137, 14.60128369746704),
    new GLatLng(37.91904192681665, 15.35832653742206));
var groundOverlay = new GGroundOverlay(
    "http://bbs.keyhole.com/ubb/z0302a1700/etna.jpg",
    etnaBounds);
map.addOverlay(groundOverlay);
