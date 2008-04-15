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
    center: "slides/title-new.html",
    onload: "setupTitlePage()"
  },
    // Recent Features
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

    // Newly launched features

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
    title: "Directions: Multi-Point",
    onload: "setupTextSlideAndMap()",
    text: "slides/directions2.html",
    code: "slides/directions2.js",
    onunload: "clearMap()",
    script: [ "slides/mypane.js" ]
  },
  {
    title: "Directions: Custom UI",
    onload: "setupTextSlideAndMap()",
    text: "slides/directions3.html",
    code: "slides/directions3.js",
    onunload: "clearMap()",
    script: [ "slides/mypane.js" ]
  },



  {
    title: "",
    footer: "Google Developer Day 2007",
    center: "slides/theend.html",
    onload: "setupTitlePage()"
  },
];
