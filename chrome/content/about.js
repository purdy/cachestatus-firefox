var about = {
  version: function (callback) {
    var version = "";
    try {
      version = (navigator.userAgent.match(/Firefox\/([\d\.]*)/) || navigator.userAgent.match(/Thunderbird\/([\d\.]*)/))[1];
    } catch (e) {}
    //FF < 4.*
    var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
      .getService(Components.interfaces.nsIVersionComparator)
      .compare(version, "4.0");
    if (versionComparator < 0) {
      var extMan = Components.classes["@mozilla.org/extensions/manager;1"]
        .getService(Components.interfaces.nsIExtensionManager);
      var addon = extMan.getItemForID("cache@status.org");
      callback(addon.version);
    }
    //FF > 4.*
    else {
      Components.utils.import("resource://gre/modules/AddonManager.jsm");
      AddonManager.getAddonByID("cache@status.org", function (addon) {
        callback(addon.version);
      });
    }
  },
  open: function (url) {
    var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
      .getService(Components.interfaces.nsIWindowMediator)
      .getMostRecentWindow('navigator:browser');
    win.gBrowser.selectedTab = win.gBrowser.addTab(url);
  }
}

window.addEventListener("load", function () {
  /* Updating addon's version */
  about.version(function (version) {
    document.getElementById("version").setAttribute("value", version);
  });
}, false);