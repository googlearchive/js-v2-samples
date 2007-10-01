function MyPane() {}
MyPane.prototype = new GControl;
MyPane.prototype.initialize = function(map) {
  var me = this;
  var p = me.panel = document.createElement("div");
  var s = p.style;
  s.width = "200px";
  s.height = "300px";
  s.backgroundColor = "#fffff0";
  s.border = "1px solid gray";
  s.overflow = "auto";
  s.fontSize = "70%";
  map.getContainer().appendChild(me.panel);
  GEvent.addDomListener(me.panel, "click", function() {
    map.removeControl(me);
  });
  return me.panel;
};
MyPane.prototype.getDefaultPosition = function() {
  return new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(10, 50));
};
MyPane.prototype.getPanel = function() {
  return me.panel;
}
map.addControl(new MyPane);
