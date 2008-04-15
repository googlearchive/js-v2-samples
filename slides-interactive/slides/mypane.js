function MyPane() {
}

MyPane.prototype = new GControl;

MyPane.prototype.initialize = function(map) {
  var me = this;
  me.panel = document.createElement("div");
  me.panel.style.width = "200px";
  me.panel.style.height = "300px";
  me.panel.style.backgroundColor = "#fffff0";
  me.panel.style.border = "1px solid gray";
  me.panel.style.opacity = "0.7";
  map.getContainer().appendChild(me.panel);
  GEvent.addDomListener(me.panel, "click", function() {
    map.removeControl(me);
  });
  return me.panel;
};

MyPane.prototype.getDefaultPosition = function() {
  return new GControlPosition(
      G_ANCHOR_TOP_RIGHT, new GSize(10, 50));
};

MyPane.prototype.getPanel = function() {
  return this.panel;
};
