import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ColorPalette, SelectControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

// Load the real base + layout-theme CSS into the block editor so the preview
// shows the actual selected design. Scoped to .bif-bookitfast-certificate-form.
import '../assets/gift-certificate.css';
import '../assets/gift-certificate-layouts.css';

// Layout choices — must match the bif-gc-layout-* CSS classes and the PHP whitelist.
const LAYOUT_OPTIONS = [
    { label: 'Classic (default)', value: 'classic' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Bold', value: 'bold' },
    { label: 'Editorial', value: 'editorial' },
    { label: 'Playful', value: 'playful' },
    { label: 'Luxury', value: 'luxury' },
];

const AMOUNT_OPTIONS = [
    { label: 'Buttons / tiles', value: 'buttons' },
    { label: 'Dropdown', value: 'dropdown' },
];

// Font stacks routed into the --bif-gc-font / --bif-gc-heading-font custom props.
const FONT_OPTIONS = [
    { label: 'Layout default', value: '' },
    { label: 'System sans-serif', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" },
    { label: 'Georgia serif', value: "Georgia, 'Times New Roman', serif" },
    { label: 'Helvetica / Arial', value: "'Helvetica Neue', Arial, sans-serif" },
    { label: 'Courier mono', value: "'Courier New', monospace" },
];

function GiftCertificateBlock({ attributes, setAttributes }) {
    const {
        buttonColor,
        buttonTextColor,
        backgroundColor = '',
        layoutStyle = 'classic',
        amountSelector = 'buttons',
        bodyFont = '',
        headingFont = '',
    } = attributes;

    return (
        <Fragment>
            <InspectorControls>
                <PanelBody title="Layout & Form" initialOpen={true}>
                    <SelectControl
                        label="Layout style"
                        value={layoutStyle}
                        options={LAYOUT_OPTIONS}
                        onChange={(value) => setAttributes({ layoutStyle: value })}
                        help="Visual theme for the gift certificate form."
                    />
                    <SelectControl
                        label="Amount selector"
                        value={amountSelector}
                        options={AMOUNT_OPTIONS}
                        onChange={(value) => setAttributes({ amountSelector: value })}
                        help="Show preset amounts as clickable tiles or a dropdown."
                    />
                </PanelBody>

                <PanelBody title="Typography" initialOpen={false}>
                    <SelectControl
                        label="Body font"
                        value={bodyFont}
                        options={FONT_OPTIONS}
                        onChange={(value) => setAttributes({ bodyFont: value })}
                    />
                    <SelectControl
                        label="Heading font"
                        value={headingFont}
                        options={FONT_OPTIONS}
                        onChange={(value) => setAttributes({ headingFont: value })}
                    />
                </PanelBody>

                <PanelBody title="Button Style" initialOpen={false}>
                    <p style={{ marginBottom: 4, fontWeight: 600 }}>Button Color</p>
                    <ColorPalette
                        value={buttonColor}
                        onChange={(color) => setAttributes({ buttonColor: color })}
                        colors={[
                            { name: 'Blue', color: '#0073aa' },
                            { name: 'Green', color: '#46b450' },
                            { name: 'Red', color: '#dc3232' },
                            { name: 'Orange', color: '#ff6900' },
                            { name: 'Purple', color: '#8224e3' },
                            { name: 'Dark', color: '#333333' },
                        ]}
                    />
                    <p style={{ margin: '12px 0 4px', fontWeight: 600 }}>Button Text Color</p>
                    <ColorPalette
                        value={buttonTextColor}
                        onChange={(color) => setAttributes({ buttonTextColor: color })}
                        colors={[
                            { name: 'White', color: '#ffffff' },
                            { name: 'Black', color: '#000000' },
                            { name: 'Dark Gray', color: '#333333' },
                            { name: 'Light Gray', color: '#666666' },
                        ]}
                    />
                </PanelBody>

                <PanelBody title="Background" initialOpen={false}>
                    <p style={{ marginBottom: 4, fontWeight: 600 }}>Form Background Color</p>
                    <p style={{ marginTop: 0, marginBottom: 8, fontSize: 12, color: '#757575' }}>
                        Override the layout&rsquo;s background so the form blends with your page. Leave empty to use the layout default.
                    </p>
                    <ColorPalette
                        value={backgroundColor}
                        onChange={(color) => setAttributes({ backgroundColor: color || '' })}
                    />
                </PanelBody>
            </InspectorControls>

            <div
                className={`bif-bookitfast-certificate-form bif-gc-layout-${layoutStyle}`}
                style={{
                    // Only override the layout accent when the user picked a colour.
                    ...(buttonColor ? { '--bif-button-color': buttonColor, '--bif-button-color-alpha': `${buttonColor}dd` } : {}),
                    ...(buttonTextColor ? { '--bif-button-text-color': buttonTextColor } : {}),
                    ...(backgroundColor ? { background: backgroundColor } : {}),
                    '--bif-gc-font': bodyFont || undefined,
                    '--bif-gc-heading-font': headingFont || undefined,
                }}
            >
                <div className="bif-form-header">
                    <h3>Purchase a Gift Certificate</h3>
                </div>
                <div className="bif-form-content">
                    <div className="bif-section">
                        <h4>Gift Certificate Details</h4>
                        <div className="bif-form-group bif-form-row">
                            <label>Amount:</label>
                            {amountSelector === 'buttons' ? (
                                <div className="bif-gc-amount-tiles">
                                    {['$100', '$200', '$350', '$500', 'Custom'].map((amt, i) => (
                                        <label key={amt} className={`bif-gc-amount-tile${i === 0 ? ' is-active' : ''}${amt === 'Custom' ? ' bif-gc-amount-custom-tile' : ''}`}>
                                            <input type="radio" name="gc_preview_amt" defaultChecked={i === 0} readOnly />
                                            <span>{amt}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <select className="bif-form-control" disabled>
                                    <option>$100.00</option>
                                    <option>$200.00</option>
                                    <option>$350.00</option>
                                </select>
                            )}
                        </div>
                        <div className="bif-form-group bif-form-row">
                            <label>To (Displayed on Certificate):</label>
                            <input type="text" className="bif-form-control" placeholder="Recipient's name" disabled />
                        </div>
                        <div className="bif-form-group bif-form-row">
                            <label>From (Displayed on Certificate):</label>
                            <input type="text" className="bif-form-control" placeholder="Your name" disabled />
                        </div>
                        <div className="bif-form-group bif-form-row">
                            <label>Message:</label>
                            <input type="text" className="bif-form-control" placeholder="Personal message" disabled />
                        </div>
                    </div>
                    <div className="bif-section">
                        <h4>Your Details</h4>
                        <div className="bif-form-group bif-form-row">
                            <label>First Name:</label>
                            <input type="text" className="bif-form-control" placeholder="Your first name" disabled />
                        </div>
                        <div className="bif-form-group bif-form-row">
                            <label>Email:</label>
                            <input type="email" className="bif-form-control" placeholder="Your email address" disabled />
                        </div>
                    </div>
                    <div className="bif-section">
                        <div className="bif-form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input type="checkbox" disabled /> <span>I consent to my information being processed for gift certificate purposes.</span>
                            </label>
                        </div>
                    </div>
                    <div id="bif-stripe-gc-payment">
                        <div className="bif-section">
                            <h4>Payment Details</h4>
                            <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, background: '#f9f9f9', color: '#888', fontSize: 13 }}>
                                Stripe card field (renders on the frontend)
                            </div>
                        </div>
                    </div>
                    <div className="bif-button-container">
                        <button type="button" className="bif-btn bif-btn-primary">Make Payment</button>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

registerBlockType('bookitfast/gift-certificate', {
    title: 'BIF Gift Certificate',
    icon: 'tickets-alt',
    category: 'widgets',
    attributes: {
        buttonColor: { type: 'string', default: '' },
        buttonTextColor: { type: 'string', default: '' },
        backgroundColor: { type: 'string', default: '' },
        layoutStyle: { type: 'string', default: 'classic' },
        amountSelector: { type: 'string', default: 'buttons' },
        bodyFont: { type: 'string', default: '' },
        headingFont: { type: 'string', default: '' },
    },
    edit: GiftCertificateBlock,
    save: () => null, // Server-side rendered
});
