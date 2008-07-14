/*
* Copyright 2008 Google
* Licensed under the Apache License, Version 2.0;
*       http://www.apache.org/licenses/LICENSE-2.0
*/
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
    title: "",
    center: "slides/logo.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Google Maps API",
    footer: "Google Developer Day 2008",
    center: "slides/title-new.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Using My Maps in your site",
    center: "slides/mymapsfordevelopers.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Embedding a map",
    center: "slides/embedding.html",
    onload: "setupTitlePage()"
  },
    // Recent Features
  {
    title: "Importing from the Maps API",
    onload: "setupTextSlideAndMap()",
    text: "slides/geoxml.html",
    code: "slides/geoxml.js",
    onunload: "clearMap()"
  },
  {
    title: "Draw a polygon",
    onload: "setupTextSlideAndMap()",
    text: "slides/polygon_drawing.html",
    code: "slides/polygon_drawing.js"
  },
  {
    title: "Edit a polygon",
    onload: "maybeSetupPolygon(0)",
    text: "slides/editing.html",
    code: "slides/editing.js"
  },
  {
    title: "Change the style",
    onload: "maybeSetupPolygon(1)",
    text: "slides/color.html",
    code: "slides/color.js"
  },
  {
    title: "Delete a vertex",
    onload: "maybeSetupPolygon(2)",
    text: "slides/delete.html",
    code: "slides/delete.js"
  },
  {
    title: "Insert a vertex",
    onload: "setupTextSlideAndMap()",
    text: "slides/insert.html",
    code: "slides/insert.js",
    onunlod: "clearMap()"
  },
  {
    title: "Extend a line",
    onload: "zoomLocal()",
    text: "slides/drawing.html",
    code: "slides/drawing.js"
  },
  {
    title: "Listen to events",
    onload: "maybeSetupPolyline(2)",
    text: "slides/listen.html",
    code: "slides/listen.js",
    onunlod: "clearMap()"
  },
  {
    title: "Responding to endline and cancelline",
    onload: "setupTextSlideAndMap()",
    text: "slides/multidraw.html",
    code: "slides/multidraw.js",
    onunlod: "clearMap()"
  },
  {
    title: "Putting it all together",
    center: "slides/alltogether.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Data API",
    center: "slides/gdata.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Authentication",
    center: "slides/auth.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Authentication",
    center: "slides/clientlogin.html",
    onload: "setupTitlePage()"
  },
  {
    title: "Putting it all together",
    center: "slides/gdata-example.html",
    onload: "setupTitlePage()"
  },
  {
    title: "",
    footer: "Google Developer Day 2008",
    center: "slides/theend.html",
    onload: "setupTitlePage()"
  },
  {
    title: "",
    center: "slides/logo.html",
    onload: "setupTitlePage()"
  },
];
