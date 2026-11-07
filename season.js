/* Nexus seasonal theme switcher.
 *
 * Christmas runs automatically from December 1st until January 6th, and the
 * harvest edition covers November. Any other month falls back to the plain
 * dark shell. Nothing else in the app has to know about seasons.
 *
 * Manual control:
 *   ?season=christmas    preview the winter pack
 *   ?season=thanksgiving  go back to harvest
 *   ?season=default      strip the season entirely
 *   ?season=auto         forget any override and follow the calendar
 * The override is remembered for the browser, so it survives navigation
 * between route pages inside the Nexus viewport.
 */
(function () {
    /* Bump when christmas.css changes so the edge cache cannot serve the
       previous pack to returning visitors. */
    var PACK_VERSION = '2026-12-01';
    var root = document.documentElement;
    var params = new URLSearchParams(window.location.search);
    var forced = (params.get('season') || '').toLowerCase();
    var stored = null;

    try {
        stored = window.localStorage.getItem('nexus-season');
    } catch (err) {
        stored = null;
    }

    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var auto = 'default';
    if (month === 12 || (month === 1 && day <= 6)) {
        auto = 'christmas';
    } else if (month === 11) {
        auto = 'thanksgiving';
    }

    var choice = forced || stored || auto;

    if (forced === 'auto' || forced === 'reset') {
        try { window.localStorage.removeItem('nexus-season'); } catch (err) {}
        choice = auto;
    } else if (forced === 'default' || forced === 'none' || forced === 'off') {
        try { window.localStorage.removeItem('nexus-season'); } catch (err) {}
        choice = 'default';
    } else if (forced === 'christmas' || forced === 'thanksgiving') {
        try { window.localStorage.setItem('nexus-season', forced); } catch (err) {}
        choice = forced;
    }

    if (choice !== 'christmas' && choice !== 'thanksgiving') {
        choice = 'default';
    }

    if (choice === 'default') {
        root.removeAttribute('data-season');
    } else {
        root.setAttribute('data-season', choice);
    }

    var pack = document.getElementById('season-pack');

    if (choice === 'christmas') {
        if (!pack) {
            pack = document.createElement('link');
            pack.id = 'season-pack';
            pack.rel = 'stylesheet';
            pack.href = 'christmas.css?v=' + PACK_VERSION;
            var base = document.querySelector('link[href*="thanksgiving.css"]');
            if (base && base.parentNode) {
                base.parentNode.insertBefore(pack, base.nextSibling);
            } else {
                document.head.appendChild(pack);
            }
        }
    } else if (pack && pack.parentNode) {
        pack.parentNode.removeChild(pack);
    }
})();
