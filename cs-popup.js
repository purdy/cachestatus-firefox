/*
 * This JavaScript handles actions the user takes from the popup (options & clear cache).
 */

function csClearCache(param) {

  function onGotSettings(settings) {
    console.log(settings.options);
    console.log(settings.dataToRemove);
    console.log(settings.dataRemovalPermitted);
  }

  function onError(error) {
    console.error(error);
  }

  browser.browsingData.settings().then(onGotSettings, onError);

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

document.querySelector("#clear-cache").addEventListener("click", csClearCache);
