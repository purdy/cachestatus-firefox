/*
 * This JavaScript handles actions the user takes from the popup (options & clear cache).
 *
 * Big thanks to the Clear Cache add-on:
 * https://github.com/TenSoja/clear-cache/blob/master/background.js
 */

function csClearCache(param) {
  console.log("in clear cache func");
  function onCleared() {
    console.log("onCleared func");
    browser.notifications.create({
      'type': 'basic',
      'iconUrl': browser.extension.getURL('icons/48.png'),
      'title': browser.i18n.getMessage("notificationTitle"),
      'message': browser.i18n.getMessage("notificationContent")
    }).then(function() {});
  }

  browser.browsingData.removeCache({}).then(onCleared, onError);

  // function onGotSettings(settings) {
  //   console.log(settings.options);
  //   console.log(settings.dataToRemove);
  //   console.log(settings.dataRemovalPermitted);
  // }

  // function onError(error) {
  //   console.error(error);
  // }

  // browser.browsingData.settings().then(onGotSettings, onError);

  // function notify() {
  //   browser.notifications.create({
  //     "type": "basic",
  //     "title": "Cleared Cache",
  //     "message": `Cleared all cache.`
  //   });
  // }

  // browser.browsingData.removeCache({}).then(notify);


  /* Old code */
  // var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
  //   .getService(Components.interfaces.nsICacheStorageService);
  // cacheService.clear();
  // if ( param && param == 'ram' ) {
  //   cacheService.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
  // } else if ( param && param == 'disk' ) {
  //   cacheService.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
  // } else {
  //   cacheService.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
  //   cacheService.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
  // }
}

function onError(error) {
  console.error(error);
}

document.querySelector("#clear-cache").addEventListener("click", function (e) {
  console.log("got a click");
  console.log(e);
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(csClearCache, onError);
});
