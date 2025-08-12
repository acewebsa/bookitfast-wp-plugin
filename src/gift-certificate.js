import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ColorPalette } from '@wordpress/components';
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
    const { buttonColor, buttonTextColor } = attributes;

    return (
        <Fragment>
            <InspectorControls>
                <PanelBody title="Button Style" initialOpen={true}>
                    <ColorPalette
                        label="Button Color"
                        value={buttonColor}
                        onChange={(color) => setAttributes({ buttonColor: color })}
                        colors={[
                            { name: 'Blue', color: '#0073aa' },
                            { name: 'Green', color: '#46b450' },
                            { name: 'Red', color: '#dc3232' },
                            { name: 'Orange', color: '#ff6900' },
                            { name: 'Purple', color: '#8224e3' },
                            { name: 'Dark', color: '#333333' }
                        ]}
                    />
                    <ColorPalette
                        label="Button Text Color"
                        value={buttonTextColor}
                        onChange={(color) => setAttributes({ buttonTextColor: color })}
                        colors={[
                            { name: 'White', color: '#ffffff' },
                            { name: 'Black', color: '#000000' },
                            { name: 'Dark Gray', color: '#333333' },
                            { name: 'Light Gray', color: '#666666' }
                        ]}
                    />
                </PanelBody>
            </InspectorControls>
            <div className="bif-gift-certificate-block">
                <div
                    className="bif-gift-certificate-button"
                    style={{ 
                        backgroundColor: buttonColor,
                        color: buttonTextColor 
                    }}
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
        },
        buttonTextColor: {
            type: 'string',
            default: '#ffffff'
        }
    },
    edit: GiftCertificateBlock,
    save: () => null, // Server-side rendered
});
