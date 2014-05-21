/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Cache Status.
 *
 * The Initial Developer of the Original Code is
 * Jason Purdy.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Thanks to the Fasterfox Extension for some pointers
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


try {
    Components.utils.import("resource://gre/modules/DownloadUtils.jsm");
    Components.utils.import("resource://gre/modules/LoadContextInfo.jsm");
} catch (e) {}
 
function cs_updated_stat( type, aDeviceInfo, prefs ) {
    var current = aDeviceInfo.totalSize;
    var max = aDeviceInfo.maximumSize;
    
    var cs_id = 'cachestatus';
    var bool_pref_key = 'auto_clear';
    var int_pref_key = 'ac';
    var clear_directive;
    if ( type == 'memory' || type == 'memory2' ) {
        cs_id += '-ram-label';
        bool_pref_key += '_ram';
        int_pref_key += 'r_percent';
        clear_directive = 'ram';
        if (type == 'memory') {
          // this is some sort of random bug workaround
          if ( current > max && current == 4096 ) {
              current = 0;
          }
          cs_updated_stat.memory = current;
          cs_updated_stat.maxmemory = max;
        }
        else {
          cs_updated_stat.memory2 = current;
        }
        
        current = (cs_updated_stat.memory || 0) + (cs_updated_stat.memory2 || 0);
        max =  cs_updated_stat.maxmemory;
        if (!max) {
          try {
            max = Components.classes["@mozilla.org/preferences-service;1"]
              .getService(Components.interfaces.nsIPrefService)
              .getBranch( "" )
              .getIntPref( 'browser.cache.memory.capacity' );
          } catch (e) {
            max = "-";
          }
        }
    } else if ( type == 'disk' || type == 'disk2' ) {
        cs_id += '-hd-label';
        bool_pref_key += '_disk';
        int_pref_key += 'd_percent';
        clear_directive = 'disk';
        if (type == 'disk') {
          cs_updated_stat.disk = current;
          cs_updated_stat.maxdisk = max;
        }
        else {
          cs_updated_stat.disk2 = current;
        }
        
        current = (cs_updated_stat.disk || 0) + (cs_updated_stat.disk2 || 0);
        max =  cs_updated_stat.maxdisk;
        if (!max) {
          try {
            max = Components.classes["@mozilla.org/preferences-service;1"]
              .getService(Components.interfaces.nsIPrefService)
              .getBranch( "" )
              .getIntPref( 'browser.cache.disk.capacity' );
          } catch (e) {
            max = "-";
          }
        }
    } else {
        // offline ... or something else we don't manage
        return;
    }
    // Now, update the status bar label...
    if (parseInt(current)) {
      current = DownloadUtils.convertByteUnits(current).join(" ");
    }
    if (parseInt(max)) {
      max = DownloadUtils.convertByteUnits(max).join(" ");
    }
            
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator("navigator:browser");
    while(enumerator.hasMoreElements()) {
        var win = enumerator.getNext();
        if (win) {
            win.document.getElementById(cs_id).setAttribute(
                'value', current + " / " + max );
        }
    }
}

function update_cache_status() {
    var cache_service = Components.classes["@mozilla.org/network/cache-service;1"]
        .getService(Components.interfaces.nsICacheService);
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService);
    var prefs  = prefService.getBranch("extensions.cachestatus.");
    //Cache 1
    var cache_visitor = {
        visitEntry: function(a,b) {},
        visitDevice: function( device, aDeviceInfo ) {
            cs_updated_stat( device, aDeviceInfo, prefs );
        }
    }
    cache_service.visitEntries( cache_visitor );
    //Cache 2
    // pref: browser.cache.use_new_backend = 1
    try {
      var cache2_service = Components.classes["@mozilla.org/netwerk/cache-storage-service;1"]
        .getService(Components.interfaces.nsICacheStorageService);
    }
    catch (e) {
      return;
    }
    if (cache_service.cacheIOTarget == cache2_service.ioTarget) return;

    // chrome://browser/content/preferences/advanced.js
    function Visitor(expected, device) {
      this.expected = expected;
      this.device = device;
    }
    Visitor.prototype = {
      expected: 0,
      sum: 0,
      QueryInterface: function listener_qi(iid) {
        if (iid.equals(Ci.nsISupports) ||
            iid.equals(Ci.nsICacheStorageVisitor)) {
          return this;
        }
        throw Components.results.NS_ERROR_NO_INTERFACE;
      },
      onCacheStorageInfo: function(num, consumption)
      {
        this.sum += consumption;
        if (!--this.expected) {
          cs_updated_stat( this.device, {totalSize: this.sum}, prefs );
        }
      }
    };
 
    var visitor = new Visitor(2, "disk2");
    cache2_service.diskCacheStorage(LoadContextInfo.default, false).asyncVisitStorage(visitor, false);
    cache2_service.diskCacheStorage(LoadContextInfo.anonymous, false).asyncVisitStorage(visitor, false);

    var visitor2 = new Visitor(2, "memory2");
    cache2_service.memoryCacheStorage(LoadContextInfo.default, false).asyncVisitStorage(visitor2, false);
    cache2_service.memoryCacheStorage(LoadContextInfo.anonymous, false).asyncVisitStorage(visitor2, false);
}

/*
 * This function takes what could be 15.8912576891 and drops it to just
 * one decimal place.  In a future version, I could have the user say
 * how many decimal places...
*/
function round_memory_usage( memory ) {
    memory = parseFloat( memory );
    memory *= 10;
    memory = Math.round(memory)/10;
    return memory;
}

// I got the cacheService code from the fasterfox extension
// http://www.xulplanet.com/references/xpcomref/ifaces/nsICacheService.html
function cs_clear_cache( param, noupdate ) {
    var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
        .getService(Components.interfaces.nsICacheService);
        
    if ( param && param == 'ram' ) {
        cacheService.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
    } else if ( param && param == 'disk' ) {
        cacheService.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
    }  else if ( param && param == 'cache2' ) {
        Components.classes["@mozilla.org/netwerk/cache-storage-service;1"]
                  .getService(Components.interfaces.nsICacheStorageService)
                  .clear();
    } 
    else {
        cacheService.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
        cacheService.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
    }
    if ( ! noupdate ) {
        update_cache_status();
    }
}

/*
 * Grabbed this helpful bit from:
 * http://kb.mozillazine.org/On_Page_Load
 * http://developer.mozilla.org/en/docs/Code_snippets:On_page_load
*/

var csExtension = {
    onPageLoad: function(aEvent) {
        update_cache_status();
    },
    QueryInterface : function (aIID) {
        if (aIID.equals(Components.interfaces.nsIObserver) ||
            aIID.equals(Components.interfaces.nsISupports) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference))
            return this;
        throw Components.results.NS_NOINTERFACE;
    },
    register: function()
    {
        var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        this._prefs  = prefService.getBranch("extensions.cachestatus.");
        
        if (this._prefs.getBoolPref( 'use_statusbar' )) {
          var statusbar = document.getElementById('status-bar');
          var showOnStatus = statusbar && statusbar.parentNode && statusbar.parentNode.clientHeight;
          showOnStatus = showOnStatus || this._prefs.getBoolPref( 'forced_on_statusbar' );
          if (showOnStatus) {
            try {
              statusbar.appendChild(document.getElementById('cachestatus-panel'));
            } catch (e) {}
          }
        }

        if ( this._prefs.getBoolPref( 'auto_update' ) ) {
            var appcontent = document.getElementById( 'appcontent' );
            if ( appcontent )
              appcontent.addEventListener( "DOMContentLoaded", this.onPageLoad, true );
        }
        this._branch = this._prefs;
        this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this._branch.addObserver("", this, true);
        this._hbox = this.grabHBox();
        this.rebuildPresence( this._prefs.getCharPref( 'presence' ) );
        
        this.welcome();
    },
    welcome: function () 
    {
        //Do not show welcome page if user has turned it off from Settings.
        if (!csExtension._prefs.getBoolPref( 'welcome' )) {
          return
        }
        //Detect Firefox version
        var version = "";
        try {
            version = (navigator.userAgent.match(/Firefox\/([\d\.]*)/) || navigator.userAgent.match(/Thunderbird\/([\d\.]*)/))[1];
        } catch (e) {}

        function welcome(version) {
            if (csExtension._prefs.getCharPref( 'version' ) == version) {
                return;
            }
            //Showing welcome screen
            setTimeout(function () {
                var newTab = getBrowser().addTab("http://add0n.com/cache-status.html?version=" + version);
                getBrowser().selectedTab = newTab;
            }, 5000);
            csExtension._prefs.setCharPref( 'version', version );
        }

        //FF < 4.*
        var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
            .getService(Components.interfaces.nsIVersionComparator)
            .compare(version, "4.0");
        if (versionComparator < 0) {
            var extMan = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
            var addon = extMan.getItemForID("cache@status.org");
            welcome(addon.version);
        }
        //FF > 4.*
        else {
            Components.utils.import("resource://gre/modules/AddonManager.jsm");
            AddonManager.getAddonByID("cache@status.org", function (addon) {
                welcome(addon.version);
            });
        }
    },
    grabHBox: function()
    {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
        var win = wm.getMostRecentWindow("navigator:browser");
        var found_hbox;
        if (win) {
            this._doc = win.document;
            found_hbox = win.document.getElementById("cs_presence");
        }
//dump( "In grabHBox(): WIN: " + win + " HB: " + found_hbox + "\n" );
        return found_hbox;
    },

    observe: function(aSubject, aTopic, aData)
    {
        if ( aTopic != 'nsPref:changed' ) return;
        // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
        // aData is the name of the pref that's been changed (relative to aSubject)
//dump( "pref changed: S: " + aSubject + " T: " + aTopic + " D: " + aData + "\n" );
        if ( aData == 'auto_update' ) {
            var add_event_handler = this._prefs.getBoolPref( 'auto_update' );
            if ( add_event_handler ) {
                window.addEventListener( 'load', this.onPageLoad, true );
            } else {
                window.removeEventListener( 'load', this.onPageLoad, true );
            }
        } else if ( aData == 'presence' ) {
            var presence = this._prefs.getCharPref( 'presence' );
            if ( presence == 'original' || presence == 'icons' ) {
                this.rebuildPresence( presence );
            } else {
                dump( "Unknown presence value: " + presence + "\n" );
            }
        }
    },

    rebuildPresence: function(presence)
    {
        // Take the hbox 'cs_presence' and replace it
        if ( this._hbox == null ) {
            this._hbox = this.grabHBox();
        }
        var hbox = this._hbox;
        var child_node = hbox.firstChild;
        while( child_node != null ) {
            hbox.removeChild( child_node );
            child_node = hbox.firstChild;
        }
        var popupset = this._doc.getElementById( 'cs_popupset' );
        var child_node = popupset.firstChild;
        while( child_node != null ) {
            popupset.removeChild( child_node );
            child_node = popupset.firstChild;
        }
        var string_bundle = this._doc.getElementById( 'cache-status-strings' );
        if ( presence == 'original' ) {
            var ram_image = this._doc.createElement( 'image' );
            ram_image.setAttribute(
                'tooltiptext', string_bundle.getString( 'ramcache' ) );
            ram_image.setAttribute( 'src', 'chrome://cachestatus/skin/ram.png' );
            var ram_label = this._doc.createElement( 'label' );
            ram_label.setAttribute( 'id', 'cachestatus-ram-label' );
            ram_label.setAttribute(
                'value', ': ' + string_bundle.getString( 'nly' ) );
            ram_label.setAttribute(
                'tooltiptext', string_bundle.getString( 'ramcache' ) );
            var disk_image = this._doc.createElement( 'image' );
            disk_image.setAttribute(
                'tooltiptext', string_bundle.getString( 'diskcache' ) );
            disk_image.setAttribute( 'src', 'chrome://cachestatus/skin/hd.png' );
            var disk_label = this._doc.createElement( 'label' );
            disk_label.setAttribute(
                'tooltiptext', string_bundle.getString( 'diskcache' ) );
            disk_label.setAttribute( 'id', 'cachestatus-hd-label' );
            disk_label.setAttribute(
                'value', ': ' + string_bundle.getString( 'nly' ) );
            hbox.appendChild( ram_image );
            hbox.appendChild( ram_label );
            hbox.appendChild( disk_image );
            hbox.appendChild( disk_label );
        } else if ( presence == 'icons' ) {
            var ram_tooltip = this._doc.createElement( 'tooltip' );
            ram_tooltip.setAttribute( 'id', 'ram_tooltip' );
            ram_tooltip.setAttribute( 'orient', 'horizontal' );
            var ram_desc_prefix = this._doc.createElement( 'description' );
            ram_desc_prefix.setAttribute( 'id', 'cachestatus-ram-prefix' );
            ram_desc_prefix.setAttribute(
                'value', string_bundle.getString( 'ramcache' ) + ':' );
            ram_desc_prefix.setAttribute( 'style', 'font-weight: bold;' );
            var ram_desc = this._doc.createElement( 'description' );
            ram_desc.setAttribute( 'id', 'cachestatus-ram-label' );
            ram_desc.setAttribute(
                'value', string_bundle.getString( 'nly' ) );
            ram_tooltip.appendChild( ram_desc_prefix );
            ram_tooltip.appendChild( ram_desc );
            var hd_tooltip = this._doc.createElement( 'tooltip' );
            hd_tooltip.setAttribute( 'id', 'hd_tooltip' );
            hd_tooltip.setAttribute( 'orient', 'horizontal' );
            var hd_desc_prefix = this._doc.createElement( 'description' );
            hd_desc_prefix.setAttribute( 'id', 'cachestatus-hd-prefix' );
            hd_desc_prefix.setAttribute(
                'value', string_bundle.getString( 'diskcache' ) + ':' );
            hd_desc_prefix.setAttribute( 'style', 'font-weight: bold;' );
            var hd_desc = this._doc.createElement( 'description' );
            hd_desc.setAttribute( 'id', 'cachestatus-hd-label' );
            hd_desc.setAttribute(
                'value', string_bundle.getString( 'nly' ) );
            hd_tooltip.appendChild( hd_desc_prefix );
            hd_tooltip.appendChild( hd_desc );
            popupset.appendChild( ram_tooltip );
            popupset.appendChild( hd_tooltip );
            hbox.parentNode.insertBefore( popupset, hbox );
            var ram_image = this._doc.createElement( 'image' );
            ram_image.setAttribute( 'src', 'chrome://cachestatus/skin/ram.png' );
            ram_image.setAttribute( 'tooltip', 'ram_tooltip' );
            var disk_image = this._doc.createElement( 'image' );
            disk_image.setAttribute( 'src', 'chrome://cachestatus/skin/hd.png' );
            disk_image.setAttribute( 'tooltip', 'hd_tooltip' );
            hbox.appendChild( ram_image );
            hbox.appendChild( disk_image );
        }
    }
}

// I can't just call csExtension.register directly b/c the XUL
// might not be loaded yet.
window.addEventListener( 'load', function() { csExtension.register(); }, false );
