/**
 * Availability Calendar — front-end interactivity.
 * Free (available) nights are selectable: clicking one selects it (single
 * selection per calendar) and fires a `bif:date-selected` CustomEvent that
 * other code (e.g. a booking form) can listen for. Booked/past nights are
 * inert (rendered as disabled buttons server-side).
 */
(function () {
    'use strict';

    function initCalendar(cal) {
        var days = cal.querySelectorAll('.bif-cal__day.is-free');
        for (var i = 0; i < days.length; i++) {
            days[i].addEventListener('click', function () {
                var day = this;
                var already = day.classList.contains('is-selected');
                var prev = cal.querySelectorAll('.bif-cal__day.is-selected');
                for (var j = 0; j < prev.length; j++) { prev[j].classList.remove('is-selected'); }
                if (!already) { day.classList.add('is-selected'); }
                cal.dispatchEvent(new CustomEvent('bif:date-selected', {
                    bubbles: true,
                    detail: { date: already ? null : day.getAttribute('data-date') }
                }));
            });
        }
        initNav(cal);
    }

    // Prev/next month paging for the scrollable (bif-cal--nav) layout.
    function initNav(cal) {
        var vp = cal.querySelector('.bif-cal__viewport');
        if (!vp) { return; }
        var track = vp.querySelector('.bif-cal__months');
        var prevBtn = vp.querySelector('.bif-cal__nav--prev');
        var nextBtn = vp.querySelector('.bif-cal__nav--next');
        if (!track || !prevBtn || !nextBtn) { return; }

        function page(dir) {
            track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
        }
        function sync() {
            var maxScroll = track.scrollWidth - track.clientWidth - 2;
            prevBtn.disabled = track.scrollLeft <= 2;
            nextBtn.disabled = track.scrollLeft >= maxScroll;
        }
        prevBtn.addEventListener('click', function () { page(-1); });
        nextBtn.addEventListener('click', function () { page(1); });
        track.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        sync();
    }

    function boot() {
        var cals = document.querySelectorAll('.bif-cal');
        for (var i = 0; i < cals.length; i++) { initCalendar(cals[i]); }
    }

    if (document.readyState !== 'loading') { boot(); }
    else { document.addEventListener('DOMContentLoaded', boot); }
})();
