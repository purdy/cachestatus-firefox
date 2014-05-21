/*
 * Author: Jason Purdy <Jason@Purdy.INFO>
 * Date: January 24, 2006
*/

var CSSettings = {
    load_settings: function() {
        // Get the "extensions.myext." branch
        var pref_service = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        var prefs = pref_service.getBranch( "" );
        // Get the presence preference
        var preference = prefs.getCharPref( 'extensions.cachestatus.presence' );
        document.getElementById('presence').value = preference;

        // Get the automatic update preference
        document.getElementById('auto_update').checked = prefs.getBoolPref('extensions.cachestatus.auto_update');
        document.getElementById('use_statusbar').checked = prefs.getBoolPref('extensions.cachestatus.use_statusbar');
        document.getElementById('forced_on_statusbar').checked = prefs.getBoolPref('extensions.cachestatus.forced_on_statusbar');
        document.getElementById('welcome').checked = prefs.getBoolPref('extensions.cachestatus.welcome');

        // auto clear settings
        /*
         This is being disabled for now:
         http://code.google.com/p/cachestatus/issues/detail?id=10
        */
        /*
        document.getElementById('auto_clear_ram').checked = prefs.getBoolPref('extensions.cachestatus.auto_clear_ram');
        document.getElementById('acr_percent').value = prefs.getIntPref('extensions.cachestatus.acr_percent');
        document.getElementById('auto_clear_disk').checked = prefs.getBoolPref('extensions.cachestatus.auto_clear_disk');
        document.getElementById('acd_percent').value = prefs.getIntPref('extensions.cachestatus.acd_percent');
        */

        // Need to get the browser.cache.disk.capacity setting
        // and put it into the max_disk_cache textbox
        var disk_capacity = prefs.getIntPref( 'browser.cache.disk.capacity' );
        if ( disk_capacity != null ) {
           document.getElementById('max_disk_cache').value = disk_capacity;
        }
        if ( prefs.prefHasUserValue( 'browser.cache.memory.capacity' ) ) {
            var ram_capacity = prefs.getIntPref( 'browser.cache.memory.capacity' );
            document.getElementById('max_ram_cache').value = ram_capacity;
        }
    },
    save_settings: function() {
        var pref_service = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        var prefs = pref_service.getBranch( "extensions.cachestatus." );
        // Set the 'presence' preference, which is a string
        // setting to either 'original', 'icons' or 'logo'
        var preference = document.getElementById('presence').value;
        prefs.setCharPref( 'presence', preference );
        // Set the 'auto_update' preference, using the state of the
        // checkbox
        prefs.setBoolPref( 'auto_update', document.getElementById('auto_update').checked );
        // checkbox
        prefs.setBoolPref( 'use_statusbar', document.getElementById('use_statusbar').checked );
        // checkbox
        prefs.setBoolPref( 'forced_on_statusbar', document.getElementById('forced_on_statusbar').checked );
        // checkbox
        prefs.setBoolPref( 'welcome', document.getElementById('welcome').checked );
        /*
         This is being disabled for now:
         http://code.google.com/p/cachestatus/issues/detail?id=10
        */
        /*
        prefs.setBoolPref( 'auto_clear_ram', document.getElementById( 'auto_clear_ram' ).checked );
        var acr_percent_value = document.getElementById( 'acr_percent' ).value;
        if ( acr_percent_value > 0 && acr_percent_value < 100 ) {
            prefs.setIntPref( 'acr_percent', acr_percent_value );
        }
        prefs.setBoolPref( 'auto_clear_disk', document.getElementById( 'auto_clear_disk' ).checked );
        var acd_percent_value = document.getElementById( 'acd_percent' ).value;
        if ( acd_percent_value > 0 && acd_percent_value < 100 ) {
            prefs.setIntPref( 'acd_percent', acd_percent_value );
        }
        */
        // Set the cache settings, if they check out
        prefs = pref_service.getBranch( 'browser.cache.' );
        var disk_value = document.getElementById('max_disk_cache').value;
        if ( disk_value > 0 ) {
            prefs.setIntPref( 'disk.capacity', disk_value );
        }
        var ram_value = document.getElementById('max_ram_cache').value;
        if ( ram_value > 0 ) {
            prefs.setIntPref( 'memory.capacity', ram_value );
        }
    }
};
