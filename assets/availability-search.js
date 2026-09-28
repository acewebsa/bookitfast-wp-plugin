/**
 * Availability Search — front-end.
 *
 * Supports three date-picker styles (chosen per block):
 *   - fields : two date inputs (check-out can't be before check-in)
 *   - nights : a check-in date + a "nights" selector
 *   - range  : a single drag-to-select range calendar (click-click also works)
 *
 * On submit it computes nights, formats the check-in as DD-MM-YYYY, and
 * redirects (GET) to the booking page with ?start=&nights=. Built entirely with
 * safe DOM methods (createElement / textContent) — no innerHTML, no third-party code.
 */
(function () {
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function toDMY(ymd) { var p = ymd.split('-'); return p.length === 3 ? (p[2] + '-' + p[1] + '-' + p[0]) : ymd; }
    function fromIso(s) { var p = s.split('-'); return new Date(+p[0], (+p[1]) - 1, +p[2]); }
    function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function fmtShort(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3); }
    function same(a, b) { return a && b && a.getTime() === b.getTime(); }
    function nightsBetween(sIso, eIso) { return Math.round((fromIso(eIso).getTime() - fromIso(sIso).getTime()) / 86400000); }

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) { e.className = cls; }
        if (text != null) { e.textContent = text; }
        return e;
    }

    /* ---- Range calendar (drag-to-select, with click-click fallback) ---- */
    function initRange(form) {
        var dr = form.querySelector('.bif-search__daterange');
        if (!dr) { return; }
        var input = dr.querySelector('.bif-search__range-input');
        var startH = dr.querySelector('.bif-search__start');
        var endH = dr.querySelector('.bif-search__end');
        var today = startOfDay(new Date());
        var view = new Date(today.getFullYear(), today.getMonth(), 1);
        var start = null, end = null;
        var pointerActive = false, anchor = null, dragged = false, justDragged = false;

        var pop = document.createElement('div');
        pop.className = 'bif-search__cal';
        pop.hidden = true;
        pop.setAttribute('role', 'dialog');
        dr.appendChild(pop);

        function syncInput() {
            if (start && end) {
                input.value = fmtShort(start) + ' – ' + fmtShort(end) + ' ' + end.getFullYear();
                startH.value = iso(start); endH.value = iso(end);
            } else if (start) {
                input.value = fmtShort(start) + ' – …';
                startH.value = iso(start); endH.value = '';
            } else {
                input.value = ''; startH.value = ''; endH.value = '';
            }
        }

        function navButton(dir, label, glyph) {
            var b = el('button', 'bif-cal__nav', glyph);
            b.type = 'button'; b.setAttribute('data-nav', dir); b.setAttribute('aria-label', label);
            return b;
        }

        function render() {
            var y = view.getFullYear(), m = view.getMonth();
            var startDow = new Date(y, m, 1).getDay();
            var days = new Date(y, m + 1, 0).getDate();
            pop.textContent = '';

            var head = el('div', 'bif-cal__head');
            head.appendChild(navButton('-1', 'Previous month', '‹'));
            head.appendChild(el('span', 'bif-cal__title', MONTHS[m] + ' ' + y));
            head.appendChild(navButton('1', 'Next month', '›'));
            pop.appendChild(head);

            var dow = el('div', 'bif-cal__dow');
            for (var i = 0; i < 7; i++) { dow.appendChild(el('span', null, DOW[i])); }
            pop.appendChild(dow);

            var grid = el('div', 'bif-cal__grid');
            for (var b = 0; b < startDow; b++) { grid.appendChild(el('span', 'bif-cal__empty')); }
            for (var d = 1; d <= days; d++) {
                var cur = new Date(y, m, d);
                var cls = 'bif-cal__day';
                var disabled = cur < today;
                if (disabled) { cls += ' is-disabled'; }
                if (same(cur, start)) { cls += ' is-start'; }
                if (same(cur, end)) { cls += ' is-end'; }
                if (start && end && cur > start && cur < end) { cls += ' is-inrange'; }
                var btn = el('button', cls, String(d));
                btn.type = 'button';
                if (disabled) { btn.disabled = true; }
                btn.setAttribute('data-d', iso(cur));
                grid.appendChild(btn);
            }
            pop.appendChild(grid);
        }

        function open() { pop.hidden = false; render(); }
        function close() { pop.hidden = true; }
        function dayAt(x, y) {
            var node = document.elementFromPoint(x, y);
            var d = node && node.closest ? node.closest('.bif-cal__day') : null;
            return (d && !d.disabled && pop.contains(d)) ? fromIso(d.getAttribute('data-d')) : null;
        }

        input.addEventListener('click', function () { pop.hidden ? open() : close(); });

        // Drag selection.
        pop.addEventListener('pointerdown', function (e) {
            if (e.target.closest('[data-nav]')) { return; }
            var day = e.target.closest('.bif-cal__day');
            if (!day || day.disabled) { return; }
            e.preventDefault();
            anchor = fromIso(day.getAttribute('data-d'));
            pointerActive = true; dragged = false;
        });
        pop.addEventListener('pointermove', function (e) {
            if (!pointerActive) { return; }
            var over = dayAt(e.clientX, e.clientY);
            if (!over || same(over, anchor)) { return; }
            dragged = true;
            start = over < anchor ? over : anchor;
            end = over < anchor ? anchor : over;
            syncInput(); render();
        });
        function endDrag() {
            if (!pointerActive) { return; }
            pointerActive = false;
            if (dragged) {
                justDragged = true;
                if (start && end) { syncInput(); setTimeout(close, 150); }
            }
        }
        pop.addEventListener('pointerup', endDrag);
        document.addEventListener('pointerup', endDrag);

        // Click-click fallback (fires after pointerup).
        pop.addEventListener('click', function (e) {
            var nav = e.target.closest('[data-nav]');
            if (nav) { view = new Date(view.getFullYear(), view.getMonth() + parseInt(nav.getAttribute('data-nav'), 10), 1); render(); return; }
            if (justDragged) { justDragged = false; return; }
            var day = e.target.closest('.bif-cal__day');
            if (!day || day.disabled) { return; }
            var picked = fromIso(day.getAttribute('data-d'));
            if (!start || (start && end)) { start = picked; end = null; }
            else if (picked <= start) { start = picked; end = null; }
            else { end = picked; }
            syncInput(); render();
            if (start && end) { setTimeout(close, 150); }
        });

        document.addEventListener('click', function (e) { if (!dr.contains(e.target)) { close(); } });
    }

    /* ---- Two fields: keep check-out on/after check-in ---- */
    function initFields(form) {
        var ci = form.querySelector('.bif-search__checkin');
        var co = form.querySelector('.bif-search__checkout');
        if (!ci || !co) { return; }
        ci.addEventListener('change', function () {
            if (!ci.value) { return; }
            var min = iso(new Date(fromIso(ci.value).getTime() + 86400000));
            co.min = min;
            if (co.value && co.value <= ci.value) { co.value = min; }
        });
    }

    function initSubmit(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var err = form.querySelector('.bif-search__error');
            function fail(msg) { if (err) { err.textContent = msg; err.hidden = false; } }
            if (err) { err.hidden = true; }
            var target = form.getAttribute('data-target') || form.getAttribute('action') || '';

            var sv = '', nights = null;
            if (form.querySelector('.bif-search__daterange')) {
                sv = (form.querySelector('.bif-search__start') || {}).value || '';
                var ev = (form.querySelector('.bif-search__end') || {}).value || '';
                if (ev) { var d = nightsBetween(sv, ev); if (isNaN(d) || d < 1) { fail('Your check-out must be after check-in.'); return; } nights = d; }
            } else {
                var ci = form.querySelector('.bif-search__checkin');
                sv = ci ? ci.value : '';
                var nightsEl = form.querySelector('.bif-search__nights');
                if (nightsEl) {
                    nights = parseInt(nightsEl.value, 10) || 1; if (nights < 1) { nights = 1; }
                } else {
                    var co = form.querySelector('.bif-search__checkout');
                    var ev2 = co ? co.value : '';
                    if (ev2) { var d2 = nightsBetween(sv, ev2); if (isNaN(d2) || d2 < 1) { fail('Your check-out must be after check-in.'); return; } nights = d2; }
                }
            }

            if (!target || target === '#') { fail('No booking page has been set for this search.'); return; }
            if (!sv) { fail('Please select your dates.'); return; }
            if (nights == null) { nights = 1; }

            var sep = target.indexOf('?') !== -1 ? '&' : '?';
            window.location.href = target + sep + 'start=' + encodeURIComponent(toDMY(sv)) + '&nights=' + nights;
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var forms = document.querySelectorAll('form.bif-search');
        for (var i = 0; i < forms.length; i++) {
            initRange(forms[i]);
            initFields(forms[i]);
            initSubmit(forms[i]);
        }
    });
})();
