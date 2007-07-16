//<![CDATA[

    // A TextualZoomControl is a GControl that displays textual "Zoom In"
    // and "Zoom Out" buttons (as opposed to the iconic buttons used in
    // Google Maps).
    function TextualZoomControl() {
    }
    TextualZoomControl.prototype = new GControl();

    // Creates a one DIV for each of the buttons and places them in a container
    // DIV which is returned as our control element. We add the control to
    // to the map container and return the element for the map class to
    // position properly.
    TextualZoomControl.prototype.initialize = function(map) {
      var container = document.createElement("div");

      var zoomInDiv = document.createElement("div");
      this.setButtonStyle_(zoomInDiv, "in");
      container.appendChild(zoomInDiv);
      GEvent.addDomListener(zoomInDiv, "click", function() {
        map.zoomIn();
      });

      var zoomOutDiv = document.createElement("div");
      this.setButtonStyle_(zoomOutDiv, "out");
      container.appendChild(zoomOutDiv);
      GEvent.addDomListener(zoomOutDiv, "click", function() {
        map.zoomOut();
      });

      map.getContainer().appendChild(container);
      return container;
    }

    // By default, the control will appear in the top left corner of the
    // map with 7 pixels of padding.
    TextualZoomControl.prototype.getDefaultPosition = function() {
      return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(7, 7));
    }

    // Sets the proper CSS for the given button element.
    TextualZoomControl.prototype.setButtonStyle_ = function(button, label) {
      button.style.textDecoration = "underline";
      button.style.color = "#0000cc";
      button.style.background = "url('bluezoom_" + label +".png')";
      button.style.border = "none";
      button.style.marginBottom = "3px";
      button.style.width = "44px";
      button.style.height = "44px";
      button.style.cursor = "pointer";
    }
