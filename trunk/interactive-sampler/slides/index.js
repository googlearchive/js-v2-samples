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
var SLIDES = [
  {
    title: "Google Maps API",
    footer: "Google Developer Day 2007",
    center: "slides/title.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Basics",
    footer: "Google Developer Day 2007",
    onload: "setupTextSlideAndMap()",
    text: "slides/basic.html",
    code: "slides/basic.js:readonly"
  },
  {
    title: "Movement and Animation",
    onload: "setupTextSlideAndMap()",
    text: "slides/movement.html",
    code: "slides/movement.js"
  },
  {
    title: "Controls",
    onload: "setupTextSlideAndMap()",
    text: "slides/controls.html",
    code: "slides/controls.js"
  },
  {
    title: "Events",
    onload: "setupTextSlideAndMap()",
    text: "slides/event.html",
    code: "slides/event.js"
  },
  {
    title: "Info Window",
    onload: "setupTextSlideAndMap()",
    text: "slides/infowindow.html",
    code: "slides/infowindow.js",
    onunload: "clearMap()"
  },
  {
    title: "Markers",
    onload: "setupTextSlideAndMap()",
    text: "slides/markers.html",
    code: "slides/markers.js",
    onunload: "clearMap()"
  },
  {
    title: "Marker Image",
    onload: "setupTextSlideAndMap()",
    text: "slides/setimage.html",
    code: "slides/setimage.js",
    onunload: "clearMap()"
  },
  {
    title: "Marker Animation",
    onload: "setupTextSlideAndMap()",
    text: "slides/setpoint.html",
    code: "slides/setpoint.js",
    onunload: "clearMap()"
  },
  {
    title: "Polylines",
    onload: "setupTextSlideAndMap()",
    text: "slides/polyline.html",
    code: "slides/polyline.js",
    onunload: "clearMap()"
  },
  {
    title: "Click Handling",
    onload: "setupTextSlideAndMap()",
    text: "slides/clickhandling.html",
    code: "slides/clickhandling.js",
    onunload: "clearMap()"
  },
  {
    title: "Markers with InfoWindows",
    onload: "setupTextSlideAndMap()",
    text: "slides/infomarker.html",
    code: "slides/infomarker.js",
    onunload: "clearMap()"
  },
  {
    title: "Icons",
    onload: "setupTextSlideAndMap()",
    text: "slides/icons.html",
    code: "slides/icons.js",
    onunload: "clearMap()"
  },
  {
    title: "Asynchronous HTTP",
    onload: "setupTextSlideAndMap()",
    text: "slides/downloadurl.html",
    code: "slides/downloadurl.js",
    onunload: "clearMap()"
  },
  {
    title: "Custom Controls",
    onload: "setupTextSlideAndMap()",
    text: "slides/customcontrol.html",
    code: "slides/customcontrol.js",
    onunload: "clearMap()"
  },
  {
    title: "Geocoder",
    onload: "setupTextSlideAndMap()",
    text: "slides/geocoder.html",
    code: "slides/geocoder.js",
    onunload: "clearMap()"
  },
  {
    title: "Marker Manager",
    onload: "setupTextSlideAndMap()",
    text: "slides/markermanager.html",
    code: "slides/markermanager.js",
    onunload: "clearMap()"
  },
  {
    title: "XML Overlays",
    onload: "setupTextSlideAndMap()",
    text: "slides/geoxml.html",
    code: "slides/geoxml.js",
    onunload: "clearMap()"
  },
  {
    title: "Tile Layer Overlay",
    onload: "setupTextSlideAndMap()",
    text: "slides/tilelayeroverlay.html",
    code: "slides/tilelayeroverlay.js",
    onunload: "clearMap()"
  },
  {
    title: "Ground Overlay",
    onload: "setupTextSlideAndMap()",
    text: "slides/groundoverlay.html",
    code: "slides/groundoverlay.js",
    onunload: "clearMap()"
  },
  {
    title: "Traffic Overlay",
    onload: "setupTextSlideAndMap()",
    text: "slides/traffic.html",
    code: "slides/traffic.js",
    onunload: "clearMap()"
  },
  {
    title: "Driving Directions",
    onload: "setupTextSlideAndMap()",
    text: "slides/directions.html",
    code: "slides/directions.js",
    onunload: "clearMap()",
    script: [ "slides/mypane.js" ]
  },
  {
    title: "AdSense for Maps",
    onload: "setupTextSlideAndMap(); showCurtain(); showScreenshot('images/adsense.png', 461, 322);",
    text: "slides/adsense.html",
    code: "slides/adsense.js",
    onunload: "clearMap(); hideScreenshot(); hideCurtain()"
  },
  {
    title: "",
    footer: "Google Developer Day 2007",
    center: "slides/theend.html",
    onload: "setupTitlePage()",
  },
];
