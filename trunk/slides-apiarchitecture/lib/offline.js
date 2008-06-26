function getStore() {
  if (!window.google || !google.gears || !google.gears.factory) {
    return null;
  }

  var server = google.gears.factory.create("beta.localserver");
  var storeName = "mesch-talk";
  var store = server.openManagedStore(storeName);
  if (!store) {
    store = server.createManagedStore(storeName);
    store.manifestUrl = "manifest.json";
  }

  return store;
}

function checkOffline() {
  var el = $('offline');

  var store = getStore();
  if (!store) {
    return false;
  }

  if (store.enabled) {
    if (store.currentVersion) {
      el.className = 'ok';
    } else {
      el.className = 'error';
    }
  }
  return true;
}

function toggleOffline() {
  var store = getStore();
  if (!store) {
    return;
  }

  var el = $('offline');

  if (store.enabled) {
    store.enabled = false;
    el.className = 'disabled';

  } else {
    store.enabled = true;
    store.checkForUpdate();
    el.className = 'checking';

    var timerId = window.setInterval(function() {
        if (store.currentVersion) {
          el.className = 'ok';
          window.clearInterval(timerId);
          alert(store.currentVersion);
        } else if (store.updateStatus == 1) {
          el.className = 'checking';
        } else if (store.updateStatus == 2) {
          el.className = 'loading';
        } else if (store.updateStatus == 3) {
          el.className = 'error';
          alert(store.lastErrorMessage);
          window.clearInterval(timerId);
        }
      }, 500);
  }
}

function initoffline() {
  if (checkOffline()) {
    $('offline').onclick = toggleOffline;
  }
}
