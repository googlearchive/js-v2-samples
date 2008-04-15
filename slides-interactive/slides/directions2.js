div = document.getElementById('dir');
var dir = new GDirections(map, div);

dir.loadFromWaypoints(["Paris",
                       "Versailles",
                       "Fontainebleau"],
                      {locale: "fr"});
