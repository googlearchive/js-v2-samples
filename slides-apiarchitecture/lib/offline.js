/*
*
* Copyright 2008 Google
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*       http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

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
