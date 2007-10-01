var tiny = new GIcon();
tiny.image = "images/tiny_red.png";
tiny.shadow = "images/tiny_red_shadow.png";
tiny.iconSize = new GSize(12, 20);
tiny.shadowSize = new GSize(22, 20);
tiny.iconAnchor = new GPoint(6, 20);
tiny.infoWindowAnchor = new GPoint(5, 1);
map.setCenter(
    new GLatLng(51.178865, -1.826413), 7);
map.addOverlay(
    new GMarker(map.getCenter(), { icon: tiny }));
