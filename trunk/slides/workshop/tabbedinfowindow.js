var tabs = [
  new GInfoWindowTab("Tab #1", "Hello"),
  new GInfoWindowTab("Tab #2", "World")
];
map.openInfoWindowTabsHtml(map.getCenter(),
                           tabs);
