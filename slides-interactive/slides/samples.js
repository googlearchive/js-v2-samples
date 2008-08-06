// Add your slides here. At minimum you need to specify the title of the slide.
// Everything else is optional. A slide entry supports the following
// attributes:
//
//   title: The title part of the slide.
//   style: An array of CSS files to load.
//   script: An array of Javascripts to load.
//   text: HTML to load into the text panel (bullet points, mostly)
//   code: Code to be loaded into the code panel (Javascript)
//   onload: What to do when this page loads.
//   onunload: What to do when this page unloads.
var codeArray = [
 {
 category: 'Basic',
 samples: [
  {
    title: "Movement and Animation",
    text: "slides/movement.html",
    code: "slides/movement.js"
  },
  {
    title: "Info Window",
    text: "slides/infowindow.html",
    code: "slides/infowindow.js",
    onunload: "clearMap()"
  }
 ]},
 {
 category: 'Events',
 samples: [
  {
    title: "Events",
    text: "slides/event.html",
    code: "slides/event.js"
  }
 ]},
 {
 category: 'Controls',
 samples: [
  {
    title: "Controls",
    text: "slides/controls.html",
    code: "slides/controls.js"
  },
  {
    title: "Custom Controls",
    text: "slides/customcontrol.html",
    code: "slides/customcontrol.js",
    onunload: "clearMap()"
  }
 ]},
 {
 category: 'Overlays',
 samples: [
  {
    title: "Markers",
    text: "slides/markers.html",
    code: "slides/markers.js",
    onunload: "clearMap()"
  },
  {
    title: "Icons",
    text: "slides/icons.html",
    code: "slides/icons.js",
    onunload: "clearMap()"
  },
  {
    title: "Marker Image",
    text: "slides/setimage.html",
    code: "slides/setimage.js",
    onunload: "clearMap()"
  },
  {
    title: "Marker Animation",
    text: "slides/setpoint.html",
    code: "slides/setpoint.js",
    onunload: "clearMap()"
  },
  {
    title: "Click Handling",
    text: "slides/clickhandling.html",
    code: "slides/clickhandling.js",
    onunload: "clearMap()"
  },
/*
  {
    title: "Markers with InfoWindows",
    text: "slides/infomarker.html",
    code: "slides/infomarker.js",
    onunload: "clearMap()"
  },
*/
  {
    title: "Polylines",
    text: "slides/polyline.html",
    code: "slides/polyline.js",
    onunload: "clearMap()"
  },
  {
    title: "Tile Layer Overlay",
    text: "slides/tilelayeroverlay.html",
    code: "slides/tilelayeroverlay.js",
    onunload: "clearMap()"
  },
  {
    title: "Ground Overlay",
    text: "slides/groundoverlay.html",
    code: "slides/groundoverlay.js",
    onunload: "clearMap()"
  }
/*
,
  {
    title: "Marker Manager",
    text: "slides/markermanager.html",
    code: "slides/markermanager.js",
    onunload: "clearMap()"
  }
*/
 ]},
 {
 category: 'Services',
 samples: [
  {
    title: "Asynchronous HTTP",
    text: "slides/downloadurl.html",
    code: "slides/downloadurl.js",
    onunload: "clearMap()"
  },
  {
    title: "Geocoder",
    text: "slides/geocoder.html",
    code: "slides/geocoder.js",
    onunload: "clearMap()"
  },
  {
    title: "XML Overlays",
    text: "slides/geoxml.html",
    code: "slides/geoxml.js",
    onunload: "clearMap()"
  },
  {
    title: "Traffic Overlay",
    text: "slides/traffic.html",
    code: "slides/traffic.js",
    onunload: "clearMap()"
  },
  {
    title: "Driving Directions",
    text: "slides/directions.html",
    code: "slides/directions.js",
    onunload: "clearMap()",
    script: [ "slides/mypane.js" ]
  },
  {
    title: "Directions: Multi-Point",
    text: "slides/directions2.html",
    code: "slides/directions2.js",
    onunload: "clearMap()",
    script: [ "slides/mypane.js" ]
  }
/*
,
  {
    title: "Directions: Custom UI",
    text: "slides/directions3.html",
    code: "slides/directions3.js",
    onunload: "clearMap()",
    script: [ "slides/mypane.js" ]
  }
*/
 ]}
];
