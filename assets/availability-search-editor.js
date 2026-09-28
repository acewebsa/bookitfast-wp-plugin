/**
 * Availability Search — block editor (vanilla, no build).
 * Preview via wp.serverSideRender; the booking page is chosen with the native
 * link picker (search a page or paste a URL).
 */
(function (wp) {
    var registerBlockType = wp.blocks.registerBlockType;
    var ed = wp.blockEditor || wp.editor;
    var InspectorControls = ed.InspectorControls;
    var LinkControl = ed.__experimentalLinkControl || null;
    var c = wp.components;
    var PanelBody = c.PanelBody, TextControl = c.TextControl, SelectControl = c.SelectControl;
    var el = wp.element.createElement, Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var SSR = wp.serverSideRender;

    function linkControl(label, url, onChange) {
        if (!LinkControl) {
            return el(TextControl, { label: label, value: url || '', onChange: onChange });
        }
        return el('div', { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' } }, label),
            el(LinkControl, { value: { url: url || '' }, settings: [], onChange: function (v) { onChange(v && v.url ? v.url : ''); } })
        );
    }

    registerBlockType('bookitfast/availability-search', {
        title: __('BIF Availability Search', 'bookitfast'),
        description: __('A "find your stay" form that sends check-in / check-out to your booking page.', 'bookitfast'),
        icon: 'search',
        category: 'widgets',
        supports: { align: ['wide', 'full'] },
        attributes: {
            heading: { type: 'string', default: 'Find your stay' },
            targetUrl: { type: 'string', default: '' },
            buttonText: { type: 'string', default: 'Search' },
            checkinLabel: { type: 'string', default: 'Check-in' },
            checkoutLabel: { type: 'string', default: 'Check-out' },
            pickerStyle: { type: 'string', default: 'range' },
            align: { type: 'string', default: '' }
        },
        edit: function (props) {
            var a = props.attributes, set = props.setAttributes;
            return el(Fragment, {},
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Search Form', 'bookitfast'), initialOpen: true },
                        el(TextControl, { label: __('Heading', 'bookitfast'), value: a.heading, onChange: function (v) { set({ heading: v }); } }),
                        el(SelectControl, {
                            label: __('Date Picker Style', 'bookitfast'),
                            value: a.pickerStyle,
                            options: [
                                { label: __('Range calendar (drag to select)', 'bookitfast'), value: 'range' },
                                { label: __('Two fields (check-in / check-out)', 'bookitfast'), value: 'fields' },
                                { label: __('Check-in + nights', 'bookitfast'), value: 'nights' }
                            ],
                            onChange: function (v) { set({ pickerStyle: v }); }
                        }),
                        linkControl(__('Booking Page (where the search goes)', 'bookitfast'), a.targetUrl, function (v) { set({ targetUrl: v }); }),
                        el(TextControl, { label: __('Button Text', 'bookitfast'), value: a.buttonText, onChange: function (v) { set({ buttonText: v }); } }),
                        a.pickerStyle !== 'range' && el(TextControl, { label: __('Check-in Label', 'bookitfast'), value: a.checkinLabel, onChange: function (v) { set({ checkinLabel: v }); } }),
                        a.pickerStyle === 'fields' && el(TextControl, { label: __('Check-out Label', 'bookitfast'), value: a.checkoutLabel, onChange: function (v) { set({ checkoutLabel: v }); } })
                    )
                ),
                el(SSR, { block: 'bookitfast/availability-search', attributes: a })
            );
        },
        save: function () { return null; }
    });
})(window.wp);
