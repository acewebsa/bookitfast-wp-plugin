import { useState, useEffect, Fragment } from 'react';
const { registerBlockType } = wp.blocks;
const { TextControl, Button, PanelBody, ToggleControl } = wp.components;
const { InspectorControls } = wp.blockEditor || wp.editor;
//const { Fragment } = wp.element;

// Add the API URL helper function
function getWPApiUrl() {
	const apiLink = document.querySelector('link[rel="https://api.w.org/"]');
	if (!apiLink) return '/wp-json';
	return apiLink.href.replace(/\/$/, ''); // Remove trailing slash if present
}

const API_BASE = getWPApiUrl();

registerBlockType('bookitfast/gift-certificate', {
	title: 'Gift Certificate Purchase',
	icon: 'tickets-alt',
	category: 'common',
	attributes: {
		// Save any settings you need for the preview
		buttonColor: { type: 'string', default: '#00a80f' },
		previewContent: { type: 'string', default: 'Gift Certificate Purchase Form' }
	},
	edit: ( props ) => {
		const { attributes: { buttonColor, previewContent }, setAttributes } = props;
		const [gcSettings, setGCSettings] = useState(null);
		useEffect(() => {
			async function fetchGCSettings() {
				try {
					// Update the fetch URL to use API_BASE
					const response = await fetch(`${API_BASE}/bookitfast/v1/gc-settings`);
					const settings = await response.json();
					setGCSettings(settings);
				} catch (error) {
					console.error('Error fetching gift certificate settings:', error);
				}
			}
			fetchGCSettings();
		}, []);
		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title="Block Settings">
						<TextControl
							label="Button Color"
							value={ buttonColor }
							onChange={ ( newColor ) => setAttributes({ buttonColor: newColor }) }
						/>
					</PanelBody>
				</InspectorControls>
				<div style={ { border: `2px solid ${buttonColor}`, padding: '1rem' } }>
					<h3>Gift Certificate Purchase</h3>
					<p>{ previewContent }</p>
					<p>This is a preview of the front‑end gift certificate purchase form.</p>
				</div>
			</Fragment>
		);
	},
	save: () => {
		// A dynamic block: the saved content is rendered on the server via PHP.
		return null;
	},
});
