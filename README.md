cachestatus-firefox
===================

This is the code repository for the Cache Status extension/addon for Firefox. Unfortunately, Firefox has removed the way this add-on accessed the cache, starting in version 57, and [it appears](https://discourse.mozilla.org/t/updating-my-add-on-is-this-even-possible-now/25204) there is no new way to work with the cache system from the add-on layer at this point.

I have posted a request on [the Mozilla bug system](https://bugzilla.mozilla.org/show_bug.cgi?id=1435914), so if there's ever support in the future, then I will revisit this and see if I can get an updated add-on.

That said, this webextension branch is a testbed to play around w/ the new WebExtension API to see if I can get something working.
