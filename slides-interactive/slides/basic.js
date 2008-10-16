<html>
<head>
  <script type="text/javascript" src="http://maps.google.com/maps?file=api&v=2&key=ABQ...c"></script>
  <script>
  function createMap() {
    var map = new GMap2(document.getElementById("map"));
    map.setCenter(new GLatLng(37.44, -122.14), 14);
  }
  </script>
</head>
<body onload="createMap()" onunload="GUnload()">
 <div id="map" style="width:100%;height:50%"></div>
</body>
</html>
