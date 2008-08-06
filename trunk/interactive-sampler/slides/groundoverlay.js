map.setCenter(new GLatLng(37.35, 15.18), 8);
var etnaBounds = new GLatLngBounds(
    new GLatLng(37.465433, 14.601283),
    new GLatLng(37.919041, 15.358326));

var groundOverlay = new GGroundOverlay(
    "http://bbs.keyhole.com/ubb/" +
    "z0302a1700/etna.jpg",
    etnaBounds);
map.addOverlay(groundOverlay);
