var where = new GLatLng(35.039545, 135.72842);
var opts = {
  title: "Golden Pavilion Temple, Kyoto"
};
var marker = new GMarker(where, opts);
map.setCenter(where, 17);
map.addOverlay(marker);
