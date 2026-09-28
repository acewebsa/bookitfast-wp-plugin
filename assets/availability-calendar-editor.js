/**
 * Availability Calendar — block editor (vanilla, no build).
 * Single property, sourced from the /property-availability-calendar API.
 * Preview via wp.serverSideRender (the API is called + parsed server-side).
 */
(function (wp) {
    var registerBlockType = wp.blocks.registerBlockType;
    var ed = wp.blockEditor || wp.editor;
    var InspectorControls = ed.InspectorControls;
    var PanelColorSettings = ed.PanelColorSettings || (wp.editor && wp.editor.PanelColorSettings) || null;
    var c = wp.components;
    var PanelBody = c.PanelBody, TextControl = c.TextControl, SelectControl = c.SelectControl, ToggleControl = c.ToggleControl;
    var el = wp.element.createElement, Fragment = wp.element.Fragment;
    var useState = wp.element.useState, useEffect = wp.element.useEffect;
    var __ = wp.i18n.__;
    var SSR = wp.serverSideRender;
    var apiFetch = wp.apiFetch;

    // Normalise the various property shapes the /properties API may return.
    function normaliseProperties(raw) {
        var list = [];
        if (!raw) { return list; }
        var arr = Array.isArray(raw) ? raw : (raw.properties || raw.data || raw.results || []);
        if (!Array.isArray(arr)) { return list; }
        arr.forEach(function (p) {
            if (!p || typeof p !== 'object') { return; }
            var id = p.id || p.property_id || p.propertyId || p.value || p.ID;
            var name = p.name || p.property_name || p.title || p.label || ('#' + id);
            if (id) { list.push({ value: String(id), label: String(name) }); }
        });
        return list;
    }

    function PropertyControl(p) {
        var a = p.a, set = p.set;
        var stateProps = useState(null), props = stateProps[0], setProps = stateProps[1];
        var stateErr = useState(false), failed = stateErr[0], setFailed = stateErr[1];

        useEffect(function () {
            var cancelled = false;
            if (!apiFetch) { setFailed(true); return; }
            apiFetch({ path: '/bookitfast/v1/properties' }).then(function (res) {
                if (cancelled) { return; }
                setProps(normaliseProperties(res));
            }).catch(function () {
                if (cancelled) { return; }
                setFailed(true);
            });
            return function () { cancelled = true; };
        }, []);

        // Manual property-ID entry (fallback when the list can't be loaded).
        var manual = el(TextControl, {
            label: __('Property ID', 'bookitfast'),
            type: 'number',
            help: __('The Book It Fast property to show availability for.', 'bookitfast'),
            value: a.propertyId ? String(a.propertyId) : '',
            onChange: function (v) { set({ propertyId: parseInt(v, 10) || 0 }); }
        });

        if (failed) { return manual; }
        if (props === null) {
            return el(SelectControl, { label: __('Property', 'bookitfast'), value: '', options: [{ label: __('Loading properties…', 'bookitfast'), value: '' }], disabled: true });
        }
        if (!props.length) { return manual; }

        var options = [{ label: __('— Select a property —', 'bookitfast'), value: '' }].concat(props);
        return el(SelectControl, {
            label: __('Property', 'bookitfast'),
            value: a.propertyId ? String(a.propertyId) : '',
            options: options,
            onChange: function (v) { set({ propertyId: parseInt(v, 10) || 0 }); }
        });
    }

    registerBlockType('bookitfast/availability-calendar', {
        title: __('BIF Availability Calendar', 'bookitfast'),
        description: __('Month grid of booked vs. free nights for a property, synced from the booking engine.', 'bookitfast'),
        icon: 'calendar-alt',
        category: 'widgets',
        supports: { align: ['wide', 'full'] },
        attributes: {
            heading: { type: 'string', default: '' },
            propertyId: { type: 'number', default: 0 },
            months: { type: 'number', default: 2 },
            navigate: { type: 'boolean', default: false },
            loadMonths: { type: 'number', default: 12 },
            bookedColor: { type: 'string', default: '' },
            availableColor: { type: 'string', default: '' },
            fillAvailable: { type: 'boolean', default: false },
            showLegend: { type: 'boolean', default: true },
            align: { type: 'string', default: '' }
        },
        edit: function (props) {
            var a = props.attributes, set = props.setAttributes;
            var colorPanel = PanelColorSettings ? el(PanelColorSettings, {
                title: __('Colours', 'bookitfast'),
                initialOpen: true,
                colorSettings: [
                    { value: a.availableColor, onChange: function (v) { set({ availableColor: v || '' }); }, label: __('Available colour', 'bookitfast') },
                    { value: a.bookedColor, onChange: function (v) { set({ bookedColor: v || '' }); }, label: __('Booked colour', 'bookitfast') }
                ]
            }) : null;
            return el(Fragment, {},
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Calendar', 'bookitfast'), initialOpen: true },
                        el(TextControl, { label: __('Heading (optional)', 'bookitfast'), value: a.heading, onChange: function (v) { set({ heading: v }); } }),
                        el(PropertyControl, { a: a, set: set }),
                        el(SelectControl, {
                            label: a.navigate ? __('Months shown at once', 'bookitfast') : __('Months shown', 'bookitfast'),
                            value: String(a.months),
                            options: [
                                { label: '1', value: '1' },
                                { label: '2', value: '2' },
                                { label: '3', value: '3' },
                                { label: '4', value: '4' },
                                { label: '6', value: '6' },
                                { label: '12', value: '12' }
                            ],
                            onChange: function (v) { set({ months: parseInt(v, 10) || 2 }); }
                        }),
                        el(ToggleControl, {
                            label: __('Enable month scrolling', 'bookitfast'),
                            help: __('Load more months and let visitors page through with prev/next arrows.', 'bookitfast'),
                            checked: a.navigate,
                            onChange: function (v) { set({ navigate: v }); }
                        }),
                        a.navigate ? el(SelectControl, {
                            label: __('Months to load', 'bookitfast'),
                            help: __('How many months are available to scroll through.', 'bookitfast'),
                            value: String(a.loadMonths),
                            options: [
                                { label: '3', value: '3' },
                                { label: '6', value: '6' },
                                { label: '12', value: '12' },
                                { label: '18', value: '18' },
                                { label: '24', value: '24' }
                            ],
                            onChange: function (v) { set({ loadMonths: parseInt(v, 10) || 12 }); }
                        }) : null,
                        el(ToggleControl, {
                            label: __('Fill available cells', 'bookitfast'),
                            help: __('Tint the background of available nights with the available colour (border only when off).', 'bookitfast'),
                            checked: a.fillAvailable,
                            onChange: function (v) { set({ fillAvailable: v }); }
                        }),
                        el(ToggleControl, { label: __('Show legend', 'bookitfast'), checked: a.showLegend, onChange: function (v) { set({ showLegend: v }); } })
                    ),
                    colorPanel
                ),
                el(SSR, { block: 'bookitfast/availability-calendar', attributes: a })
            );
        },
        save: function () { return null; }
    });
})(window.wp);
