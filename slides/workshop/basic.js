<head>
  <script type="text/javascript"
      href="http://maps.google.com/maps?file=api&v=2&key=ABQ...c">
  function createMap() {
    if (GBrowserIsCompatible()) {
      var map = new GMap2(document.getElementById("map"));
      map.setCenter(new GLatLng(37.44, -122.14), 14);
    }
  }
  </script>
</head>
<body onload="createMap()" onunload="GUnload()">..</body>
