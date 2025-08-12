import MultiEmbedForm from "./components/MultiEmbedForm";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl, RangeControl, Button } from "@wordpress/components";
import { ColorPalette } from "@wordpress/components";
import { Icon } from "@wordpress/components";
import { 
	search, 
	calendar, 
	home, 
	mapMarker, 
	starFilled, 
	pin, 
	pinSmall, 
	globe
} from "@wordpress/icons";
import '../assets/editor.css';
const { useState, useEffect } = wp.element;

registerBlockType("bookitfast/multi-embed", {
	title: "Book It Fast Availability",
	description: "A multi-property booking embed for WordPress.",
	icon: "calendar",
	category: "widgets",

	attributes: {
		propertyIds: {
			type: "string",
			default: "", // Store selected IDs as a comma-separated string
		},
		showDiscount: { type: "boolean", default: false },
		showSuburb: { type: "boolean", default: false },
		showPostcode: { type: "boolean", default: false },
		showRedeemGiftCertificate: { type: "boolean", default: false },
		showComments: { type: "boolean", default: false },
		buttonColor: {
			type: "string",
			default: "#0073aa"
		},
		buttonTextColor: {
			type: "string",
			default: "#ffffff"
		},
		minNights: {
			type: "number",
			default: 1
		},
		maxNights: {
			type: "number",
			default: 14
		},
		showPropertyImages: {
			type: "boolean",
			default: false
		},
		includeIcons: {
			type: "boolean",
			default: false
		},
		layoutStyle: {
			type: "string",
			default: "cards"
		},
		buttonIcon: {
			type: "string",
			default: "search"
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps();
		const [properties, setProperties] = useState([]);
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState(null);

		useEffect(() => {
			// Fetch properties from the existing WP function
			wp.apiFetch({ path: "/bookitfast/v1/properties" })
				.then((data) => {
					if (data.success) {
						setProperties(data.properties);
					} else {
						setError("Failed to fetch properties.");
					}
				})
				.catch((err) => {
					console.error("API Fetch Error:", err);
					setError("Error fetching properties.");
				})
				.finally(() => setLoading(false));
		}, []);

		// Handle Multi-Select Property Change
		const handlePropertyChange = (selected) => {
			const formattedIds = selected.join(","); // Convert array to comma-separated string
			setAttributes({ propertyIds: formattedIds });
		};

		return (
			<div {...blockProps}>
				{/* Sidebar Settings */}
				<InspectorControls>
					<PanelBody title="Search Options" initialOpen={true}>
						{loading ? (
							<p>Loading properties...</p>
						) : error ? (
							<p style={{ color: "red" }}>{error}</p>
						) : (
							<SelectControl
								multiple
								label="Select Properties"
								value={attributes.propertyIds ? attributes.propertyIds.split(",") : []}
								options={properties.map((property) => ({
									label: property.title,
									value: property.id.toString(),
								}))}
								onChange={handlePropertyChange}
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
							/>
						)}

						<RangeControl
							label="Minimum Nights"
							value={attributes.minNights}
							onChange={(value) => setAttributes({ minNights: value })}
							min={1}
							max={30}
							step={1}
						/>
						<RangeControl
							label="Maximum Nights"
							value={attributes.maxNights}
							onChange={(value) => setAttributes({ maxNights: value })}
							min={attributes.minNights || 1}
							max={90}
							step={1}
						/>

						<ColorPalette
							label="Button Color"
							value={attributes.buttonColor}
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
							value={attributes.buttonTextColor}
							onChange={(color) => setAttributes({ buttonTextColor: color })}
							colors={[
								{ name: 'White', color: '#ffffff' },
								{ name: 'Black', color: '#000000' },
								{ name: 'Dark Gray', color: '#333333' },
								{ name: 'Light Gray', color: '#666666' }
							]}
						/>
						
						{/* Button Icon Selector */}
						<div style={{ marginBottom: '16px' }}>
							<label style={{ 
								display: 'block', 
								marginBottom: '8px', 
								fontSize: '11px', 
								fontWeight: '500', 
								textTransform: 'uppercase', 
								color: '#1e1e1e' 
							}}>
								Button Icon
							</label>
							<div style={{ 
								display: 'grid', 
								gridTemplateColumns: 'repeat(4, 1fr)', 
								gap: '8px', 
								padding: '8px', 
								border: '1px solid #ddd', 
								borderRadius: '4px',
								backgroundColor: '#fff'
							}}>
								{[
									{ icon: search, name: 'search', label: 'Search' },
									{ icon: calendar, name: 'calendar', label: 'Calendar' },
									{ icon: home, name: 'home', label: 'Home' },
									{ icon: mapMarker, name: 'mapMarker', label: 'Map Marker' },
									{ icon: starFilled, name: 'star', label: 'Star' },
									{ icon: pin, name: 'pin', label: 'Pin' },
									{ icon: pinSmall, name: 'pinSmall', label: 'Pin Small' },
									{ icon: globe, name: 'globe', label: 'Globe' }
								].map(({ icon, name, label }) => (
									<Button
										key={name}
										onClick={() => setAttributes({ buttonIcon: name })}
										variant={attributes.buttonIcon === name ? 'primary' : 'secondary'}
										style={{
											width: '48px',
											height: '48px',
											padding: '8px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center'
										}}
										title={label}
									>
										<Icon icon={icon} size={20} />
									</Button>
								))}
							</div>
							<p style={{ 
								fontSize: '12px', 
								color: '#757575', 
								margin: '8px 0 0 0',
								fontStyle: 'italic'
							}}>
								Select an icon for the search button
							</p>
						</div>
					</PanelBody>
					<PanelBody title="Results Layout" initialOpen={false}>
						<SelectControl
							label="Layout Style"
							value={attributes.layoutStyle}
							options={[
								{ label: 'Card List', value: 'cards' },
								{ label: 'Grid Tiles', value: 'grid' },
								{ label: 'Compact Rows', value: 'rows' }
							]}
							onChange={(value) => setAttributes({ layoutStyle: value })}
							help="Choose how property results are displayed"
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label="Show Property Images"
							checked={attributes.showPropertyImages}
							onChange={(value) => setAttributes({ showPropertyImages: value })}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label="Include Icons"
							checked={attributes.includeIcons}
							onChange={(value) => setAttributes({ includeIcons: value })}
							help="Show icons for bed size, inclusions, etc."
							__nextHasNoMarginBottom={true}
						/>
					</PanelBody>
					<PanelBody title="Form Settings" initialOpen={false}>
						<ToggleControl
							label="Show Discount Field"
							checked={attributes.showDiscount}
							onChange={(value) => setAttributes({ showDiscount: value })}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label="Show Suburb Field"
							checked={attributes.showSuburb}
							onChange={(value) => setAttributes({ showSuburb: value })}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label="Show Postcode Field"
							checked={attributes.showPostcode}
							onChange={(value) => setAttributes({ showPostcode: value })}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label="Show Redeem Gift Certificate Section"
							checked={attributes.showRedeemGiftCertificate}
							onChange={(value) => setAttributes({ showRedeemGiftCertificate: value })}
							__nextHasNoMarginBottom={true}
						/>
						<ToggleControl
							label="Show Comments Field"
							checked={attributes.showComments}
							onChange={(value) => setAttributes({ showComments: value })}
							__nextHasNoMarginBottom={true}
						/>
					</PanelBody>
				</InspectorControls>

				{/* Pass Attributes to MultiEmbedForm */}
				<MultiEmbedForm
					propertyIds={attributes.propertyIds}
					showDiscount={attributes.showDiscount}
					showSuburb={attributes.showSuburb}
					showPostcode={attributes.showPostcode}
					showRedeemGiftCertificate={attributes.showRedeemGiftCertificate}
					showComments={attributes.showComments}
					buttonColor={attributes.buttonColor}
					buttonTextColor={attributes.buttonTextColor}
					buttonIcon={attributes.buttonIcon}
					minNights={attributes.minNights}
					maxNights={attributes.maxNights}
					showPropertyImages={attributes.showPropertyImages}
					includeIcons={attributes.includeIcons}
					layoutStyle={attributes.layoutStyle}
				/>
			</div>
		);
	},

	save: () => null, // Dynamic rendering via PHP
});
