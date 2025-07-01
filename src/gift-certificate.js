import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ColorPicker } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

// Gift Certificate API functions
function getWPApiUrl() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const wpIndex = parts.indexOf('wp-content');

    if (wpIndex !== -1) {
        const basePath = parts.slice(0, wpIndex).join('/');
        return window.location.origin + basePath + '/wp-json';
    }

    return window.location.origin + '/wp-json';
}

async function fetchGCSettings() {
    try {
        const response = await fetch(`${getWPApiUrl()}/bookitfast/v1/gift-certificate-settings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching gift certificate settings:', error);
        return null;
    }
}

// Gift Certificate Block Component
function GiftCertificateBlock({ attributes, setAttributes }) {
    const { buttonColor } = attributes;

    return (
        <Fragment>
            <InspectorControls>
                <PanelBody title="Gift Certificate Settings">
                    <ColorPicker
                        color={buttonColor}
                        onChange={(color) => setAttributes({ buttonColor: color })}
                        enableAlpha={false}
                    />
                </PanelBody>
            </InspectorControls>
            <div className="bif-gift-certificate-block">
                <div
                    className="bif-gift-certificate-button"
                    style={{ backgroundColor: buttonColor }}
                >
                    Gift Certificate
                </div>
                <p>Gift certificate form will appear here on the frontend.</p>
            </div>
        </Fragment>
    );
}

// Register the Gift Certificate Block
registerBlockType('bookitfast/gift-certificate', {
    title: 'Gift Certificate',
    icon: 'tickets-alt',
    category: 'widgets',
    attributes: {
        buttonColor: {
            type: 'string',
            default: '#0073aa'
        }
    },
    edit: GiftCertificateBlock,
    save: () => null, // Server-side rendered
});
