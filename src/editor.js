import MultiEmbedForm from "./components/MultiEmbedForm";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl, RangeControl, Button, BaseControl } from "@wordpress/components";
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

// Direction slugs reused across multiple surface dropdowns.
const DIRECTION_OPTIONS = [
	{ label: 'Quiet Ledger (minimal)', value: 'quiet-ledger' },
	{ label: 'Warm Itemised', value: 'warm-itemised' },
	{ label: 'Editorial Receipt', value: 'editorial-receipt' },
	{ label: 'Stacked & Removable', value: 'stacked-removable' },
	{ label: 'Two-Column Ledger', value: 'two-column-ledger' },
];

registerBlockType("bookitfast/multi-embed", {
	title: "BIF Availability",
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
		searchLayout: {
			type: "string",
			default: "default"
		},
		searchBoxRadius: {
			type: "number",
			default: 60
		},
		summaryLayout: {
			type: "string",
			default: "classic"
		},
		searchFormLayout: {
			type: "string",
			default: "default"
		},
		propertySelectionLayout: {
			type: "string",
			default: "cards"
		},
		yourDetailsLayout: {
			type: "string",
			default: "classic"
		},
		termsLayout: {
			type: "string",
			default: "classic"
		},
		autoSelectSingleProperty: {
			type: "boolean",
			default: false
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
					<PanelBody title="Search Layout" initialOpen={true}>
						<SelectControl
							label="Search Form Style"
							/* For backwards compat: if a legacy embed only has searchLayout
							   set (e.g. 'horizontal'), reflect that in the unified dropdown
							   even though the new searchFormLayout attribute defaults to 'default'. */
							value={
								attributes.searchFormLayout && attributes.searchFormLayout !== 'default'
									? attributes.searchFormLayout
									: (attributes.searchLayout || 'default')
							}
							options={[
								{ label: 'Default (Stacked)', value: 'default' },
								{ label: 'Horizontal (Check-In & Nights)', value: 'horizontal' },
								...DIRECTION_OPTIONS,
							]}
							onChange={(value) => {
								/* Keep the legacy searchLayout attribute in lockstep for
								   default/horizontal so the existing renderer continues to
								   work; for the new directions, searchFormLayout drives the
								   dedicated DOMs and searchLayout becomes a no-op. */
								if (value === 'default' || value === 'horizontal') {
									setAttributes({ searchFormLayout: value, searchLayout: value });
								} else {
									setAttributes({ searchFormLayout: value });
								}
							}}
							help="Choose the layout style for the search form."
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						{(attributes.searchFormLayout === 'horizontal' ||
							(attributes.searchFormLayout === 'default' && attributes.searchLayout === 'horizontal')) && (
							<RangeControl
								label="Corner Radius"
								value={attributes.searchBoxRadius}
								onChange={(value) => setAttributes({ searchBoxRadius: value })}
								min={0}
								max={60}
								step={4}
								help="Adjust the roundness of the search box corners (0 = square, 60 = pill)"
							/>
						)}
					</PanelBody>
					<PanelBody title="Search Options" initialOpen={false}>
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

						<ToggleControl
							label="Auto-select single property"
							checked={attributes.autoSelectSingleProperty}
							onChange={(value) => setAttributes({ autoSelectSingleProperty: value })}
							help="When the block is configured with exactly one property, skip the property-selection step and go straight to the booking summary after Search."
							__nextHasNoMarginBottom={true}
						/>

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

						<BaseControl label="Button Color" id="button-color-control">
							<ColorPalette
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
						</BaseControl>
						<BaseControl label="Button Text Color" id="button-text-color-control">
							<ColorPalette
								value={attributes.buttonTextColor}
								onChange={(color) => setAttributes({ buttonTextColor: color })}
								colors={[
									{ name: 'White', color: '#ffffff' },
									{ name: 'Black', color: '#000000' },
									{ name: 'Dark Gray', color: '#333333' },
									{ name: 'Light Gray', color: '#666666' }
								]}
							/>
						</BaseControl>
						
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
							label="Available Properties Style"
							/* For backwards compat: if a legacy embed has only layoutStyle
							   set, reflect that in the unified dropdown even though the new
							   propertySelectionLayout defaults to 'cards'. */
							value={
								attributes.propertySelectionLayout &&
								!['cards', 'grid', 'rows'].includes(attributes.propertySelectionLayout)
									? attributes.propertySelectionLayout
									: (attributes.layoutStyle || 'cards')
							}
							options={[
								{ label: 'Card List', value: 'cards' },
								{ label: 'Grid Tiles', value: 'grid' },
								{ label: 'Compact Rows', value: 'rows' },
								...DIRECTION_OPTIONS,
							]}
							onChange={(value) => {
								/* Mirror cards/grid/rows into the legacy layoutStyle attribute so
								   the classic PropertyCard / PropertyTile / PropertyRow dispatch
								   keeps working. Direction slugs go only to
								   propertySelectionLayout; runtime falls back to PropertyCard for
								   the base DOM and CSS handles the visual restyle. */
								if (['cards', 'grid', 'rows'].includes(value)) {
									setAttributes({ propertySelectionLayout: value, layoutStyle: value });
								} else {
									setAttributes({ propertySelectionLayout: value });
								}
							}}
							help="Choose how property results are displayed."
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<SelectControl
							label="Booking Summary Style"
							value={attributes.summaryLayout}
							options={[
								{ label: 'Classic', value: 'classic' },
								{ label: 'Quiet Ledger (minimal)', value: 'quiet-ledger' },
								{ label: 'Two-Column Ledger (Stripe-style)', value: 'two-column-ledger' }
							]}
							onChange={(value) => setAttributes({ summaryLayout: value })}
							help="Choose the visual style for the booking summary panel"
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
					<PanelBody title="Form Style" initialOpen={false}>
						<SelectControl
							label="Your Details Style"
							value={attributes.yourDetailsLayout}
							options={[
								{ label: 'Classic', value: 'classic' },
								{ label: 'Quiet Ledger', value: 'quiet-ledger' },
								{ label: 'Warm Itemised', value: 'warm-itemised' },
								{ label: 'Editorial Receipt', value: 'editorial-receipt' },
								{ label: 'Stacked & Removable', value: 'stacked-removable' },
							]}
							onChange={(value) => setAttributes({ yourDetailsLayout: value })}
							help="Visual style for the customer details form."
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
						<SelectControl
							label="Terms &amp; Conditions Style"
							value={attributes.termsLayout}
							options={[
								{ label: 'Classic', value: 'classic' },
								{ label: 'Quiet Ledger', value: 'quiet-ledger' },
								{ label: 'Warm Itemised', value: 'warm-itemised' },
								{ label: 'Stacked & Removable', value: 'stacked-removable' },
							]}
							onChange={(value) => setAttributes({ termsLayout: value })}
							help="Visual style for the agree-to-terms section."
							__next40pxDefaultSize={true}
							__nextHasNoMarginBottom={true}
						/>
					</PanelBody>
				</InspectorControls>

				{/* Wrap preview in the same id-scoped container the frontend uses
				    so frontend CSS (scoped under #bif-book-it-fast-multi-embed) applies,
				    and inline the button color CSS variables that the frontend gets
				    via wp_add_inline_style. */}
				<div
					id="bif-book-it-fast-multi-embed"
					style={{
						'--bif-button-color': attributes.buttonColor,
						'--bif-button-color-hover': `${attributes.buttonColor}dd`,
						'--bif-button-color-active': `${attributes.buttonColor}bb`,
						'--bif-button-text-color': attributes.buttonTextColor,
					}}
				>
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
						searchLayout={attributes.searchLayout}
						searchBoxRadius={attributes.searchBoxRadius}
						summaryLayout={attributes.summaryLayout}
						searchFormLayout={attributes.searchFormLayout}
						propertySelectionLayout={attributes.propertySelectionLayout}
						yourDetailsLayout={attributes.yourDetailsLayout}
						termsLayout={attributes.termsLayout}
						autoSelectSingleProperty={attributes.autoSelectSingleProperty}
					/>
				</div>
			</div>
		);
	},

	save: () => null, // Dynamic rendering via PHP
});
