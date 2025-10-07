import { useState, useEffect } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

function getWPApiUrl() {
	const apiLink = document.querySelector('link[rel="https://api.w.org/"]');
	if (!apiLink) {
		// Check if we're using pretty permalinks
		const restUrl = window.wpApiSettings?.restUrl || '/wp-json';
		return restUrl.replace(/\/$/, ''); // Remove trailing slash if present
	}
	return apiLink.href.replace(/\/$/, ''); // Remove trailing slash if present
}

const API_BASE = getWPApiUrl();

const stripePromiseGlobal = loadStripe('your-publishable-key-here');

const getQueryParam = (param) => {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(param);
};

const parseDateFromUrl = (dateString) => {
	const dateParts = dateString.split('-');
	if (dateParts.length === 3) {
		const [day, month, year] = dateParts.map(Number);
		if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
			const parsedDate = new Date(year, month - 1, day);
			parsedDate.setHours(12, 0, 0, 0); // Prevents timezone shift
			return parsedDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
		}
	}
	return null;
};

// Grid Tile Component
const PropertyTile = ({ property, isSelected, onToggle, nights, checkInDate, showPropertyImages, includeIcons }) => {
	const totalPrice = property.availability?.total_cost || (property.availability?.dates?.reduce((sum, date) => sum + (date.rate || 0), 0) || 0);
	const isAvailable = property.availability?.available;

	const getStatusColor = (available, reason) => {
		if (available) return 'bif-status-available';
		switch (reason) {
			case 'Booked Out': return 'bif-status-booked';
			case 'No Tariff Set': return 'bif-status-no-rate';
			case 'Min Nights': return 'bif-status-min-nights';
			default: return 'bif-status-unavailable';
		}
	};

	const getStatusText = (available, reason, minNights) => {
		if (available) return 'Available';
		switch (reason) {
			case 'Booked Out': return 'Booked Out';
			case 'No Tariff Set': return 'No Rates Set';
			case 'Min Nights': return `Minimum ${minNights || 2} Nights`;
			default: return 'Unavailable';
		}
	};

	return (
		<div className={`bif-tile ${isSelected ? 'bif-selected' : ''} ${!isAvailable ? 'is-unavailable' : ''}`}>
			{/* Hero Image */}
			{showPropertyImages && property.property_image && (
				<div className="bif-tile__hero">
					<img loading="lazy" src={property.property_image} alt={property.property_name} />
					<span className={`bif-chip ${isAvailable ? '' : 'unavailable'}`}>
						{getStatusText(isAvailable, property.availability?.availability_reason, property.availability?.min_nights)}
					</span>
				</div>
			)}

			{/* Content */}
			<div className="bif-tile__content">
				<h3 className="bif-tile__title">{property.property_name}</h3>

				{/* Amenities/Features */}
				{includeIcons && property.property_features && (
					<ul className="bif-amenities bif-amenities--slim">
						{/* WiFi */}
						{property.property_features.wifi === 1 && (
							<li><span>📶 WiFi</span></li>
						)}
						{/* Bed configurations */}
						{property.property_features.queen_beds > 0 && (
							<li><span>🛏️ {property.property_features.queen_beds} Queen</span></li>
						)}
						{property.property_features.king_beds > 0 && (
							<li><span>🛏️ {property.property_features.king_beds} King</span></li>
						)}
						{property.property_features.double_beds > 0 && (
							<li><span>🛏️ {property.property_features.double_beds} Double</span></li>
						)}
						{property.property_features.single_beds > 0 && (
							<li><span>🛏️ {property.property_features.single_beds} Single</span></li>
						)}
						{property.property_features.bunk_beds > 0 && (
							<li><span>🛏️ {property.property_features.bunk_beds} Bunk</span></li>
						)}
						{property.property_features.sofa_beds > 0 && (
							<li><span>🛋️ {property.property_features.sofa_beds} Sofa bed</span></li>
						)}
						{property.property_features.bedrooms && (
							<li><span>🏠 {property.property_features.bedrooms} Bedroom{property.property_features.bedrooms > 1 ? 's' : ''}</span></li>
						)}
						{property.property_features.living_areas && (
							<li><span>🛋️ {property.property_features.living_areas} Living Area{property.property_features.living_areas > 1 ? 's' : ''}</span></li>
						)}
					</ul>
				)}

				{/* Daily Rates */}
				{property.availability?.dates && (
					<div className="bif-tile__rates">
						{property.availability.dates.map((date, index) => (
							<div key={index} className={`bif-pill ${date.availability ? 'ok' : 'na'}`}>
								<span className="bif-pill__date">{date.date_formatted}</span>
								<strong className="bif-pill__amt">
									{date.availability ? `$${date.rate}` :
									 date.availability_reason === 'Booked Out' ? 'Booked' :
									 date.availability_reason === 'No Tariff Set' ? 'No Rate' : 'N/A'}
								</strong>
							</div>
						))}
					</div>
				)}

				{/* Footer */}
				<div className="bif-tile__footer">
					{isAvailable ? (
						<button
							onClick={onToggle}
							className={`bif-btn ${isSelected ? 'bif-btn-selected' : 'bif-btn-select'}`}
						>
							{isSelected ? '✓ Selected' : 'Select'}
						</button>
					) : (
						<button disabled className="bif-btn bif-btn-disabled">
							Unavailable
						</button>
					)}
				</div>

				{/* Optional Extras - Only show when property is selected */}
				{isSelected && property.optional_extras?.length > 0 && (
					<div className="bif-optional-extras">
						<h4 className="bif-daily-breakdown-title">Optional Extras</h4>
						<div className="bif-extras-list">
							{property.optional_extras.map((extra) => (
								<div key={extra.id} className="bif-extra-item">
									<div className="bif-extra-info">
										<input
											type="checkbox"
											checked={property.selectedExtras?.[extra.id] || false}
											onChange={() => property.onToggleExtra?.(property.id, extra.id)}
										/>
										<label>{extra.description}</label>
									</div>
									<div className="bif-extra-price">${extra.amount}</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// Compact Row Component
const PropertyRow = ({ property, isSelected, onToggle, nights, checkInDate, showPropertyImages, includeIcons }) => {
	const totalPrice = property.availability?.total_cost || (property.availability?.dates?.reduce((sum, date) => sum + (date.rate || 0), 0) || 0);
	const isAvailable = property.availability?.available;

	const getStatusColor = (available) => {
		return available ? 'ok' : 'na';
	};

	return (
		<div className={`bif-row ${isSelected ? 'bif-selected' : ''} ${!isAvailable ? 'is-unavailable' : ''} ${!showPropertyImages || !property.property_image ? 'no-image' : ''}`}>
			{/* Thumbnail */}
			{showPropertyImages && property.property_image && (
				<div className="bif-row__thumb">
					<img loading="lazy" src={property.property_image} alt={property.property_name} />
				</div>
			)}

			{/* Main Info */}
			<div className="bif-row__main">
				<div className="bif-row__top">
					<h3 className="bif-row__title">{property.property_name}</h3>
					<span className={`bif-dot ${getStatusColor(isAvailable)}`} aria-hidden="true"></span>
				</div>

				{/* Inline Amenities */}
				{includeIcons && property.property_features && (
					<ul className="bif-amenities bif-amenities--inline">
						{/* WiFi */}
						{property.property_features.wifi === 1 && (
							<li><span>📶 WiFi</span></li>
						)}
						{/* Bed configurations */}
						{property.property_features.queen_beds > 0 && (
							<li><span>🛏️ {property.property_features.queen_beds} Queen</span></li>
						)}
						{property.property_features.king_beds > 0 && (
							<li><span>🛏️ {property.property_features.king_beds} King</span></li>
						)}
						{property.property_features.double_beds > 0 && (
							<li><span>🛏️ {property.property_features.double_beds} Double</span></li>
						)}
						{property.property_features.single_beds > 0 && (
							<li><span>🛏️ {property.property_features.single_beds} Single</span></li>
						)}
						{property.property_features.bunk_beds > 0 && (
							<li><span>🛏️ {property.property_features.bunk_beds} Bunk</span></li>
						)}
						{property.property_features.sofa_beds > 0 && (
							<li><span>🛋️ {property.property_features.sofa_beds} Sofa bed</span></li>
						)}
						{property.property_features.bedrooms && (
							<li><span>🏠 {property.property_features.bedrooms} Bedroom{property.property_features.bedrooms > 1 ? 's' : ''}</span></li>
						)}
						{property.property_features.living_areas && (
							<li><span>🛋️ {property.property_features.living_areas} Living Area{property.property_features.living_areas > 1 ? 's' : ''}</span></li>
						)}
					</ul>
				)}
			</div>

			{/* Rates */}
			{property.availability?.dates && (
				<div className="bif-row__rates">
					{property.availability.dates.map((date, index) => (
						<div key={index} className={`bif-rmini ${date.availability ? 'ok' : 'na'}`}>
							<div className="bif-rmini__date">{date.date_formatted}</div>
							<div className="bif-rmini__amt">
								{date.availability ? `$${date.rate}` :
								 date.availability_reason === 'Booked Out' ? 'Booked' :
								 date.availability_reason === 'No Tariff Set' ? 'No Rate' : 'N/A'}
							</div>
						</div>
					))}
				</div>
			)}

			{/* CTA */}
			<div className="bif-row__cta">
				{isAvailable ? (
					<button
						onClick={onToggle}
						className={`bif-btn ${isSelected ? 'bif-btn-selected' : 'bif-btn-select'}`}
					>
						{isSelected ? '✓ Selected' : 'Select'}
					</button>
				) : (
					<button disabled className="bif-btn bif-btn-disabled">
						Unavailable
					</button>
				)}
			</div>

			{/* Optional Extras - Only show when property is selected */}
			{isSelected && property.optional_extras?.length > 0 && (
				<div className="bif-optional-extras" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
					<h4 className="bif-daily-breakdown-title">Optional Extras</h4>
					<div className="bif-extras-list">
						{property.optional_extras.map((extra) => (
							<div key={extra.id} className="bif-extra-item">
								<div className="bif-extra-info">
									<input
										type="checkbox"
										checked={property.selectedExtras?.[extra.id] || false}
										onChange={() => property.onToggleExtra?.(property.id, extra.id)}
									/>
									<label>{extra.description}</label>
								</div>
								<div className="bif-extra-price">${extra.amount}</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

// Property Card Component
const PropertyCard = ({ property, isSelected, onToggle, nights, checkInDate, showPropertyImages, includeIcons }) => {
	const totalPrice = property.availability?.total_cost || (property.availability?.dates?.reduce((sum, date) => sum + (date.rate || 0), 0) || 0);
	const isAvailable = property.availability?.available;

	const getStatusColor = (available, reason) => {
		if (available) return 'bif-status-available';
		switch (reason) {
			case 'Booked Out': return 'bif-status-booked';
			case 'No Tariff Set': return 'bif-status-no-rate';
			case 'Min Nights': return 'bif-status-min-nights';
			default: return 'bif-status-unavailable';
		}
	};

	const getStatusText = (available, reason, minNights) => {
		if (available) return 'Available';
		switch (reason) {
			case 'Booked Out': return 'Booked Out';
			case 'No Tariff Set': return 'No Rates Set';
			case 'Min Nights': return `Minimum ${minNights || 2} Nights`;
			default: return 'Unavailable';
		}
	};

	return (
		<div className={`bif-property-card ${isSelected ? 'bif-selected' : ''} ${!isAvailable ? 'bif-unavailable' : ''}`}>
			{/* Top Section: Image, Property Info, and Status Badge */}
			<div className="bif-property-header">
				{/* Property Image */}
				{showPropertyImages && property.property_image && (
					<div className="bif-property-image">
						<img src={property.property_image} alt={property.property_name} />
					</div>
				)}

				{/* Property Info */}
				<div className="bif-property-info">
					<h3 className="bif-property-name">{property.property_name}</h3>
					{property.property_description && (
						<p className="bif-property-description">{property.property_description}</p>
					)}
					{/* Icons for property features */}
					{includeIcons && property.property_features && (
						<div className="bif-property-icons">
							{/* WiFi */}
							{property.property_features.wifi === 1 && (
								<span className="bif-property-icon" title="WiFi Available">
									📶 WiFi
								</span>
							)}
							{/* Bed configurations */}
							{property.property_features.queen_beds > 0 && (
								<span className="bif-property-icon" title={`${property.property_features.queen_beds} Queen bed${property.property_features.queen_beds > 1 ? 's' : ''}`}>
									🛏️ {property.property_features.queen_beds} Queen
								</span>
							)}
							{property.property_features.king_beds > 0 && (
								<span className="bif-property-icon" title={`${property.property_features.king_beds} King bed${property.property_features.king_beds > 1 ? 's' : ''}`}>
									🛏️ {property.property_features.king_beds} King
								</span>
							)}
							{property.property_features.double_beds > 0 && (
								<span className="bif-property-icon" title={`${property.property_features.double_beds} Double bed${property.property_features.double_beds > 1 ? 's' : ''}`}>
									🛏️ {property.property_features.double_beds} Double
								</span>
							)}
							{property.property_features.single_beds > 0 && (
								<span className="bif-property-icon" title={`${property.property_features.single_beds} Single bed${property.property_features.single_beds > 1 ? 's' : ''}`}>
									🛏️ {property.property_features.single_beds} Single
								</span>
							)}
							{property.property_features.bunk_beds > 0 && (
								<span className="bif-property-icon" title={`${property.property_features.bunk_beds} Bunk bed${property.property_features.bunk_beds > 1 ? 's' : ''}`}>
									🛏️ {property.property_features.bunk_beds} Bunk
								</span>
							)}
							{property.property_features.sofa_beds > 0 && (
								<span className="bif-property-icon" title={`${property.property_features.sofa_beds} Sofa bed${property.property_features.sofa_beds > 1 ? 's' : ''}`}>
									🛋️ {property.property_features.sofa_beds} Sofa bed
								</span>
							)}
							{/* Bedrooms and Living Areas */}
							{property.property_features.bedrooms && (
								<span className="bif-property-icon" title={`${property.property_features.bedrooms} bedroom${property.property_features.bedrooms > 1 ? 's' : ''}`}>
									🏠 {property.property_features.bedrooms} Bedroom{property.property_features.bedrooms > 1 ? 's' : ''}
								</span>
							)}
							{property.property_features.living_areas && (
								<span className="bif-property-icon" title={`${property.property_features.living_areas} living area${property.property_features.living_areas > 1 ? 's' : ''}`}>
									🛋️ {property.property_features.living_areas} Living Area{property.property_features.living_areas > 1 ? 's' : ''}
								</span>
							)}
						</div>
					)}
				</div>

				{/* Status Badge & Action - Top Right */}
				<div className="bif-property-status-container">
					<span className={`bif-property-status ${getStatusColor(isAvailable, property.availability?.availability_reason)}`}>
						{getStatusText(isAvailable, property.availability?.availability_reason, property.availability?.min_nights)}
					</span>
					{isAvailable ? (
						<button
							onClick={onToggle}
							className={`bif-btn ${isSelected ? 'bif-btn-selected' : 'bif-btn-select'} bif-header-btn`}
							style={{ marginLeft: '0.75rem' }}
						>
							{isSelected ? '✓ Selected' : 'Select Property'}
						</button>
					) : (
						<button disabled className="bif-btn bif-btn-disabled bif-header-btn" style={{ marginLeft: '0.75rem' }}>
							{getStatusText(isAvailable, property.availability?.availability_reason, property.availability?.min_nights)}
						</button>
					)}
				</div>
			</div>

			{/* Daily Rate Breakdown - Show for all properties */}
			{property.availability?.dates && (
				<div className="bif-availability-details">
					<h4 className="bif-daily-breakdown-title">Daily Rate Breakdown</h4>

					<div className="bif-daily-rates">
						{property.availability.dates.map((date, index) => (
							<div key={index} className={`bif-daily-rate ${date.availability ? 'bif-available' : 'bif-unavailable'}`}>
								<div className="bif-date">{date.date_formatted}</div>
								<div className="bif-rate">
									{date.availability ? `$${date.rate}` :
									 date.availability_reason === 'Booked Out' ? 'Booked' :
									 date.availability_reason === 'No Tariff Set' ? 'No Rate' : 'N/A'}
								</div>
							</div>
						))}
					</div>

					<div className="bif-rate-summary">
						<div className="bif-summary-row">
							<span className="bif-total">Total: ${totalPrice}</span>
						</div>
					</div>
				</div>
			)}


			{/* Optional Extras - Only show when property is selected */}
			{isSelected && property.optional_extras?.length > 0 && (
				<div className="bif-optional-extras">
					<h4 className="bif-daily-breakdown-title">Optional Extras</h4>
					<div className="bif-extras-list">
						{property.optional_extras.map((extra) => (
							<div key={extra.id} className="bif-extra-item">
								<div className="bif-extra-info">
									<input
										type="checkbox"
										checked={property.selectedExtras?.[extra.id] || false}
										onChange={() => property.onToggleExtra?.(property.id, extra.id)}
									/>
									<label>{extra.description}</label>
								</div>
								<div className="bif-extra-price">${extra.amount}</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

// Date Selector Component
const DateSelector = ({ checkInDate, nights, onDateChange, onNightsChange, onCheckAvailability, isLoading, minNights, maxNights, buttonIcon = 'search', searchLayout = 'default' }) => {
	const today = new Date().toISOString().split('T')[0];

	// Icon mapping for display - the CSS pseudo-element handles frontend, this handles editor
	const iconMap = {
		'search': '🔍',
		'calendar': '📅',
		'home': '🏠',
		'mapMarker': '📍',
		'star': '⭐',
		'pin': '📌',
		'pinSmall': '📍',
		'globe': '🌍'
	};

	const iconSymbol = iconMap[buttonIcon] || '🔍';

	// Render horizontal layout
	if (searchLayout === 'horizontal') {
		return (
			<div className="bif-search-box-horizontal">
				<div className="bif-search-field" onClick={() => document.querySelector('.bif-search-box-horizontal input[type="date"]')?.showPicker?.()}>
					<span className="bif-search-icon">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="3" y="4" width="14" height="13" rx="1" stroke="currentColor" strokeWidth="1.5"/>
							<line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5"/>
							<line x1="7" y1="2" x2="7" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
							<line x1="13" y1="2" x2="13" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
					</span>
					<div className="bif-search-field-content">
						<label>Check-In</label>
						<input
							type="date"
							value={checkInDate}
							onChange={(e) => onDateChange(e.target.value)}
							min={today}
						/>
					</div>
				</div>

				<div className="bif-search-divider"></div>

				<div className="bif-search-field">
					<span className="bif-search-icon">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<path d="M17 10.5c0 3.59-2.69 6.5-6 6.5s-6-2.91-6-6.5S7.69 4 11 4c.35 0 .69.03 1.02.09A5.5 5.5 0 0 0 17 10.5z"/>
						</svg>
					</span>
					<div className="bif-search-field-content">
						<label>Nights</label>
						<select
							value={nights}
							onChange={(e) => onNightsChange(parseInt(e.target.value))}
						>
							{[...Array(maxNights - minNights + 1).keys()].map(i => {
								const nightCount = minNights + i;
								return (
									<option key={nightCount} value={nightCount}>
										{nightCount}
									</option>
								);
							})}
						</select>
					</div>
				</div>

				<button
					onClick={onCheckAvailability}
					disabled={!checkInDate || isLoading}
					className="bif-search-button"
				>
					{isLoading ? 'Checking...' : 'Search'}
				</button>
			</div>
		);
	}

	// Default stacked layout
	return (
		<div className="bif-date-selector">
			<h2 className="bif-section-title">Select Your Dates</h2>

			<div className="bif-date-form">
				<div className="bif-form-field">
					<label>Check-in Date</label>
					<input
						type="date"
						value={checkInDate}
						onChange={(e) => onDateChange(e.target.value)}
						min={today}
						className="bif-date-input"
					/>
				</div>

				<div className="bif-form-field">
					<label>Number of Nights</label>
					<select
						value={nights}
						onChange={(e) => onNightsChange(parseInt(e.target.value))}
						className="bif-nights-select"
					>
						{[...Array(maxNights - minNights + 1).keys()].map(i => {
							const nightCount = minNights + i;
							return (
								<option key={nightCount} value={nightCount}>
									{nightCount} {nightCount === 1 ? 'night' : 'nights'}
								</option>
							);
						})}
					</select>
				</div>

				<div className="bif-form-field">
					<button
						onClick={onCheckAvailability}
						disabled={!checkInDate || isLoading}
						className="bif-btn bif-btn-primary bif-check-availability bif-has-icon-preview"
					>
						{isLoading ? (
							<>
								<div className="bif-spinner"></div>
								<span>Checking...</span>
							</>
						) : (
							<>
								<span className="bif-icon-preview">{iconSymbol}</span>
								<span>Check Availability</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

// Booking Summary Component - Streamlined version
const BookingSummary = ({
	selectedProperties,
	selectedExtras,
	nights,
	total,
	discountCode,
	onDiscountCodeChange,
	onApplyDiscount,
	checkInDate,
	summary,
	showDiscount = false,
	showRedeemGiftCertificate = false,
	giftCertificate,
	onGiftCertificateChange,
	showGiftCertificateForm,
	onTriggerShowGiftCertificate,
	onApplyGiftCertificate,
	gcResult,
	gcLoading = false
}) => {
	const extrasTotal = Object.values(selectedExtras).flat().reduce((sum, extra) => sum + (extra.amount || 0), 0);

			// Check if discount is actually applied based on summary data
	const isDiscountApplied = summary && parseFloat(summary.order_discount_code_total || 0) > 0;

	const applyDiscount = () => {
		if (discountCode.trim()) {
			onApplyDiscount(discountCode);
		}
	};

	if (!selectedProperties || selectedProperties.length === 0) return null;

	return (
		<div className="bif-booking-summary">
			<h3 className="bif-section-title">Booking Summary</h3>

			<div className="bif-summary-content">
				{/* Property Summaries - Direct display without wrapper */}
				{selectedProperties.map((property) => {
					// Use sub_total from property summary if available, otherwise calculate it
					const propertySubtotal = property.sub_total ||
						property.availability?.total_cost ||
						(property.availability?.dates?.reduce((sum, date) => sum + (date.rate || 0), 0) || 0);

					// Calculate mandatory extras total
					const mandatoryExtrasTotal = property.mandatory_extras_total ||
						property.mandatory_extras?.reduce((sum, extra) => sum + parseFloat(extra.amount || 0), 0) || 0;

					// Get optional extras total from property summary
					const optionalExtrasTotal = property.optional_extras_total || 0;

					// Calculate property total (subtotal + mandatory extras + optional extras)
					const propertyTotal = parseFloat(propertySubtotal) + parseFloat(mandatoryExtrasTotal) + parseFloat(optionalExtrasTotal);

					return (
						<div key={property.id} className="bif-property-summary">
							<h5 className="bif-property-summary-name">
								{property.property_name}
							</h5>

							{/* Property Summary */}
							<div className="bif-property-total">
								<div className="bif-total-row">
									<span>Property Subtotal</span>
									<span>${parseFloat(propertySubtotal).toFixed(2)}</span>
								</div>
							</div>

							{/* Mandatory Extras */}
							{property.mandatory_extras && property.mandatory_extras.length > 0 && (
								<div className="bif-mandatory-extras-summary">
									<h4 className="bif-daily-breakdown-title">Mandatory Extras</h4>
									{property.mandatory_extras.map((extra) => (
										<div key={extra.id} className="bif-total-row" style={{ fontSize: '0.875rem', color: '#dc2626' }}>
											<span>{extra.description}</span>
											<span>${parseFloat(extra.amount).toFixed(2)}</span>
										</div>
									))}
								</div>
							)}

							{/* Optional Extras */}
							{property.optional_extras && property.optional_extras.filter(extra => extra.selected).length > 0 && (
								<div className="bif-optional-extras-summary">
									<h4 className="bif-daily-breakdown-title">Optional Extras</h4>
									{property.optional_extras.filter(extra => extra.selected).map((extra) => (
										<div key={extra.id} className="bif-total-row" style={{ fontSize: '0.875rem', color: '#92400e' }}>
											<span>{extra.description}</span>
											<span>${parseFloat(extra.amount).toFixed(2)}</span>
										</div>
									))}
								</div>
							)}

							{/* Property Total (Subtotal + Mandatory Extras + Optional Extras) */}
							<div className="bif-property-total">
								<div className="bif-total-row bif-subtotal">
									<span>Property Total</span>
									<span>${parseFloat(propertyTotal).toFixed(2)}</span>
								</div>
							</div>

							{/* Show selected optional extras for this property (OLD - keeping for backwards compatibility) */}
							{!property.optional_extras && selectedExtras[property.id] && selectedExtras[property.id].length > 0 && (
								<div className="bif-optional-extras-summary">
									<h4 className="bif-daily-breakdown-title">Selected Optional Extras</h4>
														{selectedExtras[property.id].map((extra) => (
						<div key={extra.id} className="bif-total-row" style={{ fontSize: '0.875rem', color: '#92400e' }}>
							<span>{extra.description}</span>
							<span>${parseFloat(extra.amount).toFixed(2)}</span>
						</div>
					))}
								</div>
							)}
						</div>
					);
				})}

				{/* Discount Code */}
				{showDiscount && (
					<div className="bif-summary-section">
						<div className="bif-discount-form">
							<input
								type="text"
								placeholder="Enter discount code"
								value={discountCode}
								onChange={(e) => onDiscountCodeChange(e.target.value)}
								className="bif-discount-input"
							/>
							<button
								onClick={applyDiscount}
								className="bif-btn bif-btn-secondary"
							>
								Apply
							</button>
						</div>
						{isDiscountApplied && (
							<div className="bif-discount-applied">
								Discount code applied
							</div>
						)}
					</div>
				)}

				{/* Gift Certificate */}
				{showRedeemGiftCertificate && summary && (
					<div className="bif-summary-section">
						<div className="bif-gift-certificate-section">
							{!showGiftCertificateForm ? (
								<button
									className="bif-btn bif-btn-secondary"
									onClick={onTriggerShowGiftCertificate}
								>
									Apply Gift Certificate
								</button>
							) : (
								<div className="bif-gift-certificate-form">
									<div className="bif-form-row">
										<div className="bif-form-field">
											<label>Certificate Number:</label>
											<input
												type="text"
												value={giftCertificate.number}
												onChange={(e) => onGiftCertificateChange({
													...giftCertificate,
													number: e.target.value
												})}
												className="bif-form-control"
												placeholder="Enter certificate number"
												disabled={gcLoading}
											/>
										</div>
										<div className="bif-form-field">
											<label>Pin:</label>
											<input
												type="number"
												value={giftCertificate.pin}
												onChange={(e) => onGiftCertificateChange({
													...giftCertificate,
													pin: e.target.value
												})}
												className="bif-form-control"
												placeholder="Enter pin"
												disabled={gcLoading}
											/>
										</div>
									</div>
									<button
										className="bif-btn bif-btn-secondary"
										onClick={onApplyGiftCertificate}
										disabled={gcLoading}
									>
										{gcLoading ? 'Applying...' : 'Apply'}
									</button>
								</div>
							)}
							{gcResult && gcResult.valid && (
								<div className="bif-gift-certificate-success">
									<p>✅ Successfully Applied Gift Certificate</p>
									<p>{gcResult.result}</p>
									{(parseFloat(gcResult.total) - parseFloat(gcResult.gc_amount_applied)) === 0 ? (
										<p><strong>🎉 Your gift certificate covers the full amount! No additional payment required.</strong></p>
									) : (
										<>
											<p>Remaining balance to pay: <strong>${(parseFloat(gcResult.total) - parseFloat(gcResult.gc_amount_applied)).toFixed(2)}</strong></p>
											<p style={{fontSize: '0.875rem', color: '#6b7280'}}>*Credit card surcharge will be added at payment</p>
										</>
									)}
									<p>Gift Certificate balance after order: <strong>${parseFloat(gcResult.gc_balance_after_order).toFixed(2)}</strong></p>
								</div>
							)}
						</div>
					</div>
				)}

								{/* Grand Total */}
				<div className="bif-grand-total">
					{/* Show original total if gift certificate applied */}
					{gcResult && gcResult.valid && (
						<div className="bif-total-row">
							<span>Order Total</span>
							<span>${parseFloat(gcResult.total || summary.order_grand_total).toFixed(2)}</span>
						</div>
					)}

					{/* Show gift certificate deduction */}
					{gcResult && gcResult.valid && (
						<div className="bif-total-row" style={{color: '#059669'}}>
							<span>Gift Certificate Applied</span>
							<span>-${parseFloat(gcResult.gc_amount_applied).toFixed(2)}</span>
						</div>
					)}

										<div className="bif-total-main">
												<span>
							{gcResult && gcResult.valid && (parseFloat(gcResult.total) - parseFloat(gcResult.gc_amount_applied)) === 0
								? "Total Paid by Gift Certificate"
								: gcResult && gcResult.valid
								? "Balance Due"
								: "Total Cost"
							}
						</span>
						<span className="bif-total-amount">
							${gcResult && gcResult.valid
								? (parseFloat(gcResult.total) - parseFloat(gcResult.gc_amount_applied)).toFixed(2)
								: parseFloat(total).toFixed(2)
							}
						</span>
					</div>

					{/* Show note about surcharge being added at payment if there's a remaining balance */}
					{gcResult && gcResult.valid && (parseFloat(gcResult.total) - parseFloat(gcResult.gc_amount_applied)) > 0 && summary && summary.order_has_surcharge && (
						<div className="bif-surcharge-note" style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>
							*Credit card surcharge will be added at payment
						</div>
					)}

					{/* Show discount text if applied */}
					{summary && parseFloat(summary.order_discount_code_total || 0) > 0 && (
						<div className="bif-discount-text">
							Includes discount of ${parseFloat(summary.order_discount_code_total || 0).toFixed(2)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// Modal Component for Local Booking Conditions
const BookingConditionModal = ({ isOpen, onClose, title, content }) => {
	useEffect(() => {
		// Prevent body scroll when modal is open
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	useEffect(() => {
		// Handle escape key press
		const handleEscape = (e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="bif-modal-overlay" onClick={onClose}>
			<div className="bif-modal" onClick={(e) => e.stopPropagation()}>
				<div className="bif-modal-header">
					<h3 className="bif-modal-title">{title}</h3>
					<button
						className="bif-modal-close"
						onClick={onClose}
						aria-label="Close modal"
					>
						×
					</button>
				</div>
				<div
					className="bif-modal-content"
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			</div>
		</div>
	);
};

// Customer Details Component - Remove emoji icons
const CustomerDetails = ({ userDetails, onUpdateDetails, formErrors, showSuburb = true, showPostcode = true, showComments = false }) => {
	return (
		<div className="bif-customer-details">
			<h2 className="bif-section-title">Your Details</h2>

			<div className="bif-customer-form">
				<div className="bif-form-row">
					<div className="bif-form-field">
						<label>First Name *</label>
						<input
							type="text"
							value={userDetails.firstName}
							onChange={(e) => onUpdateDetails('firstName', e.target.value)}
							placeholder="Enter your first name"
							className={formErrors.firstName ? 'bif-error' : ''}
						/>
						{formErrors.firstName && <div className="bif-field-error">{formErrors.firstName}</div>}
					</div>

					<div className="bif-form-field">
						<label>Last Name *</label>
						<input
							type="text"
							value={userDetails.lastName}
							onChange={(e) => onUpdateDetails('lastName', e.target.value)}
							placeholder="Enter your last name"
							className={formErrors.lastName ? 'bif-error' : ''}
						/>
						{formErrors.lastName && <div className="bif-field-error">{formErrors.lastName}</div>}
					</div>
				</div>

				<div className="bif-form-row">
					<div className="bif-form-field">
						<label>Email *</label>
						<input
							type="email"
							value={userDetails.email}
							onChange={(e) => onUpdateDetails('email', e.target.value)}
							placeholder="Enter your email address"
							className={formErrors.email ? 'bif-error' : ''}
						/>
						{formErrors.email && <div className="bif-field-error">{formErrors.email}</div>}
					</div>

					<div className="bif-form-field">
						<label>Phone *</label>
						<input
							type="tel"
							value={userDetails.phone}
							onChange={(e) => onUpdateDetails('phone', e.target.value)}
							placeholder="Enter your phone number"
							className={formErrors.phone ? 'bif-error' : ''}
						/>
						{formErrors.phone && <div className="bif-field-error">{formErrors.phone}</div>}
					</div>
				</div>

				{(showPostcode || showSuburb) && (
					<div className="bif-form-row">
						{showPostcode && (
							<div className="bif-form-field">
								<label>Postcode</label>
								<input
									type="text"
									value={userDetails.postcode}
									onChange={(e) => onUpdateDetails('postcode', e.target.value)}
									placeholder="Enter your postcode"
								/>
							</div>
						)}

						{showSuburb && (
							<div className="bif-form-field">
								<label>Suburb</label>
								<input
									type="text"
									value={userDetails.suburb}
									onChange={(e) => onUpdateDetails('suburb', e.target.value)}
									placeholder="Enter your suburb"
								/>
							</div>
						)}
					</div>
				)}


				{showComments && (
					<div className="bif-form-row bif-full-width">
						<div className="bif-form-field">
							<label>Comments</label>
							<textarea
								value={userDetails.comments}
								onChange={(e) => onUpdateDetails('comments', e.target.value)}
								rows={4}
								placeholder="Any special requests or comments..."
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// Main MultiEmbedForm Component
const MultiEmbedForm = ({
	propertyIds = '',
	showDiscount = false,
	showSuburb = true,
	showPostcode = true,
	showRedeemGiftCertificate = false,
	showComments = false,
	buttonColor = '#0073aa',
	buttonTextColor = '#ffffff',
	minNights = 1,
	maxNights = 14,
	showPropertyImages = false,
	includeIcons = false,
	layoutStyle = 'cards', // 'cards', 'grid', 'rows'
	buttonIcon = 'search',
	searchLayout = 'default' // 'default' or 'horizontal'
}) => {
	const nightsFromUrl = getQueryParam('nights');
	const validatedNights = nightsFromUrl && !isNaN(nightsFromUrl) ? Math.max(parseInt(nightsFromUrl, 10), minNights) : minNights;

	const startDateFromUrl = getQueryParam('start');
	const discountCodeFromUrl = getQueryParam('discount');
	const validatedStartDate = startDateFromUrl ? parseDateFromUrl(startDateFromUrl) : '';

	const propertyIdsString = typeof propertyIds === 'string' ? propertyIds : '';

	const [form, setForm] = useState({ date: validatedStartDate, nights: validatedNights });
	const [availability, setAvailability] = useState(null);
	const [selectionData, setSelectionData] = useState({});
	const [stripePromise, setStripePromise] = useState(null);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [userDetails, setUserDetails] = useState({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		postcode: "",
		suburb: "",
		comments: "",
	});
	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [consentToDataSharing, setConsentToDataSharing] = useState(false);
	const [discountCode, setDiscountCode] = useState(discountCodeFromUrl);
	const [discountMessage, setDiscountMessage] = useState(null);
	const [showPaymentForm, setShowPaymentForm] = useState(false);
	const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
	const [formErrors, setFormErrors] = useState({});
	const [giftCertificate, setGiftCertificate] = useState({ number: "", pin: "" });
	const [showGiftCertificateForm, setShowGiftCertificateForm] = useState(false);
	const [gcResult, setGcResult] = useState(null);
	const [gcLoading, setGcLoading] = useState(false);
	const [selectedOptionalExtras, setSelectedOptionalExtras] = useState({});
	const [showProperties, setShowProperties] = useState(false);
	const [modalCondition, setModalCondition] = useState({ isOpen: false, title: '', content: '' });

	// Handler for form data changes in DateSelector
	const handleFormDataChange = (field, value) => {
		switch (field) {
			case 'discountCode':
				setDiscountCode(value);
				break;
			case 'suburb':
			case 'postcode':
			case 'comments':
				setUserDetails(prev => ({ ...prev, [field]: value }));
				break;
		}
	};

	useEffect(() => {
		if (validatedStartDate && validatedNights) {
			console.log("Auto-checking availability with:", validatedStartDate, validatedNights);
			fetchAvailability(validatedStartDate, validatedNights);
		}
	}, [validatedStartDate, validatedNights]);

	// Fetch availability data
	const fetchAvailability = async (startDate = form.date, nights = form.nights) => {
		if (!startDate || !propertyIdsString) {
			console.warn("fetchAvailability skipped - Missing startDate or propertyIds");
			return;
		}

		const formattedStartDate = form.date;
		const propertyIdsArray = propertyIdsString.split(',').filter(id => id.trim() !== '');

		/*console.log("Requesting availability with:", {
			ids: propertyIdsArray,
			start: formattedStartDate,
			nights: nights,
		});
		*/
		setLoading(true);
		setError('');
		setShowProperties(false);

		try {
			const response = await fetch(`${API_BASE}/bookitfast/v1/availability`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ids: propertyIdsArray,
					start: formattedStartDate,
					nights: nights,
				}),
			});

			const data = await response.json();
			setAvailability(data);
			setShowProperties(true);

			// Initialize selectionData for each property
			const initialSelection = Object.keys(data).reduce((acc, propertyId) => {
				acc[propertyId] = false;
				return acc;
			}, {});
			setSelectionData(initialSelection);
		} catch (err) {
			console.error(err);
			setError('Failed to fetch availability. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Toggle property selection and fetch summary
	const toggleSelection = async (propertyId) => {
		const updatedSelection = {
			...selectionData,
			[propertyId]: !selectionData[propertyId],
		};
		setSelectionData(updatedSelection);

		// Fetch summary if at least one property is selected
		if (Object.values(updatedSelection).includes(true)) {
			await fetchSummary(updatedSelection, discountCode);
		} else {
			setSummary(null);
		}
	};

	const toggleOptionalExtra = (propertyId, extraId) => {
		setSelectedOptionalExtras(prev => {
			const propertyExtras = prev[propertyId] || {};
			const newSelectedOptionalExtras = {
				...prev,
				[propertyId]: {
					...propertyExtras,
					[extraId]: !propertyExtras[extraId]
				}
			};
			fetchSummary(selectionData, discountCode, newSelectedOptionalExtras, 0);
			return newSelectedOptionalExtras;
		});
	};

	// Fetch summary data for selected properties
	const fetchSummary = async (updatedSelection, discountCode = null, updatedOptionalExtras = selectedOptionalExtras, retryCount = 0) => {
		const start = form.date;
		const nights = form.nights;
		const end = new Date(new Date(start).getTime() + nights * 86400000).toISOString().split('T')[0];

		setLoading(true);
		setError('');
		try {
			const response = await fetch(`${API_BASE}/bookitfast/v1/availability/summary`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					selected: updatedSelection,
					selected_optional_extras: updatedOptionalExtras,
					start,
					end,
					discount_code: discountCode || null,
				}),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setSummary(data);

			// Initialize Stripe if publishable key provided
			if (data.stripe_publishable_key) {
				setStripePromise(loadStripe(data.stripe_publishable_key));
			}
		} catch (err) {
			console.error("Error fetching summary:", err);
			if (retryCount < 3) {
				console.log(`Retrying... Attempt ${retryCount + 1}`);
				await fetchSummary(updatedSelection, discountCode, updatedOptionalExtras, retryCount + 1);
			} else {
				setError('Failed to fetch summary. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	// Apply discount code
	const applyDiscountCode = (code) => {
		if (Object.keys(selectionData).some(key => selectionData[key])) {
			fetchSummary(selectionData, code);
		}
	};

	// Trigger display of gift certificate form
	const triggerShowGiftCertificate = () => {
		setShowGiftCertificateForm(true);
	};

	// Apply gift certificate via POST request
	const applyGiftCertificate = async (e) => {
		e.preventDefault();
		console.log('Gift Certificate: Apply button clicked');
		console.log('Gift Certificate Data:', giftCertificate);
		console.log('Current Summary:', summary);

		if (gcLoading) {
			console.log('Gift Certificate: Already processing, ignoring click');
			return;
		}

		if (!summary) {
			console.error('Gift Certificate: No summary available');
			return;
		}

		if (!giftCertificate.number || !giftCertificate.pin) {
			console.error('Gift Certificate: Missing number or pin');
			alert('Please enter both certificate number and pin');
			return;
		}

		setGcLoading(true);
		console.log('Gift Certificate: Setting loading state to true');

				// Prepare summary for gift certificate application
		// If there are weekly discounts applied, we need to adjust the totals
		// so the gift certificate is applied to the correct base amount
		let summaryForGiftCertificate = { ...summary };

				// If there are weekly discounts applied, adjust the summary
		if (summary.order_weekly_discount > 0) {
			console.log('Gift Certificate: Weekly discount detected, adjusting summary for gift certificate calculation');
			console.log('Gift Certificate: Original order_grand_total:', summary.order_grand_total);
			console.log('Gift Certificate: Order weekly discount:', summary.order_weekly_discount);
			console.log('Gift Certificate: Order surcharge:', summary.order_surcharge);

			// Calculate the total before weekly discount was applied (excluding surcharge)
			// Surcharge should only be applied at payment time, not when calculating gift certificate
			const totalBeforeWeeklyDiscount = parseFloat(summary.order_sub_total) + parseFloat(summary.order_mandatory_extras_total);
			console.log('Gift Certificate: Total before weekly discount (excluding surcharge):', totalBeforeWeeklyDiscount);

			// Adjust the summary to show totals before weekly discount and without surcharge
			summaryForGiftCertificate = {
				...summary,
				order_grand_total: totalBeforeWeeklyDiscount.toString(),
				order_total_before_surcharge: totalBeforeWeeklyDiscount,
				order_payable_now: totalBeforeWeeklyDiscount.toString(),
				order_surcharge: 0, // Remove surcharge for gift certificate calculation
				order_has_surcharge: false, // Temporarily disable surcharge for gift certificate calculation
				// Note: We keep the weekly discount info so the API knows about it
				// but adjust the base totals for gift certificate calculation
			};

			console.log('Gift Certificate: Adjusted summary for gift certificate:', summaryForGiftCertificate);
		}

		const data = {
			certificate: giftCertificate,
			summary: summaryForGiftCertificate
		};

		console.log('Gift Certificate: Sending request with data:', data);

		try {
			const response = await fetch(`${API_BASE}/bookitfast/v1/apply-gift-certificate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			console.log('Gift Certificate: Response status:', response.status);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

					const responseData = await response.json();
		console.log('Gift Certificate: Response data:', responseData);

		if (responseData.valid) {
			setGcResult(responseData);
			if (responseData.summary) {
				setSummary(responseData.summary);
				console.log('Gift Certificate: Updated summary:', responseData.summary);
			}
			console.log('Gift Certificate: Application successful');
			console.log('Gift Certificate: Order payable now:', responseData.order_payable_now);
		} else {
			console.error('Gift Certificate: API returned error:', responseData);
			alert(responseData.message || 'Failed to apply gift certificate');
		}
		} catch (err) {
			console.error("Gift Certificate: Error applying certificate:", err);
			alert('Error applying gift certificate. Please try again.');
		} finally {
			setGcLoading(false);
			console.log('Gift Certificate: Setting loading state to false');
		}
	};

	const validateCustomerDetails = () => {
		const errors = {};
		if (!userDetails.firstName.trim()) errors.firstName = 'First name is required';
		if (!userDetails.lastName.trim()) errors.lastName = 'Last name is required';
		if (!userDetails.email.trim()) errors.email = 'Email is required';
		if (!userDetails.phone.trim()) errors.phone = 'Phone is required';
		if (!agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
		if (!consentToDataSharing) errors.consentToDataSharing = 'You must consent to data sharing with Book It Fast service';

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handlePaymentOption = (option) => {
		if (!validateCustomerDetails()) {
			return;
		}
		setSelectedPaymentOption(option);
		setShowPaymentForm(true);
	};

	const updateUserDetails = (field, value) => {
		setUserDetails(prev => ({ ...prev, [field]: value }));
		// Clear field error when user starts typing
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: null }));
		}
	};

	// Get selected properties for display - merge with summary data if available
	const selectedProperties = availability ?
		Object.entries(availability)
			.filter(([propertyId]) => selectionData[propertyId])
			.map(([propertyId, propertyData]) => {
				// Get property summary data if available
				const propertySummary = summary?.property_summaries?.[propertyId] || {};
				return {
					id: propertyId,
					...propertyData,
					...propertySummary,
					selectedExtras: selectedOptionalExtras[propertyId],
					onToggleExtra: toggleOptionalExtra
				};
			}) : [];

	return (
		<div 
			className="bif-booking-container"
			style={{
				'--bif-button-color': buttonColor,
				'--bif-button-color-hover': `${buttonColor}dd`,
				'--bif-button-color-active': `${buttonColor}bb`,
				'--bif-button-text-color': buttonTextColor
			}}
		>
			{/* Remove the header box completely */}

			<div className="bif-booking-steps">
				{/* Step 1: Date Selection */}
				<DateSelector
					checkInDate={form.date}
					nights={form.nights}
					onDateChange={(date) => setForm(prev => ({ ...prev, date }))}
					onNightsChange={(nights) => setForm(prev => ({ ...prev, nights }))}
					onCheckAvailability={fetchAvailability}
					isLoading={loading}
					minNights={minNights}
					maxNights={maxNights}
					buttonIcon={buttonIcon}
					searchLayout={searchLayout}
				/>

				{error && <div className="bif-error-message">{error}</div>}

				{/* Step 2: Property Selection */}
				{showProperties && availability && (
					<div className="bif-property-list">
						<h2 className="bif-section-title">Available Properties</h2>
						<div className={`bif-properties bif-properties--${layoutStyle}`}>
							{Object.entries(availability).map(([propertyId, propertyData]) => {
								const propertyProps = {
									key: propertyId,
									property: {
										id: propertyId,
										...propertyData,
										selectedExtras: selectedOptionalExtras[propertyId],
										onToggleExtra: toggleOptionalExtra
									},
									isSelected: selectionData[propertyId],
									onToggle: () => toggleSelection(propertyId),
									nights: form.nights,
									checkInDate: form.date,
									showPropertyImages: showPropertyImages,
									includeIcons: includeIcons
								};

								// Render different components based on layout style
								switch (layoutStyle) {
									case 'grid':
										return <PropertyTile {...propertyProps} />;
									case 'rows':
										return <PropertyRow {...propertyProps} />;
									case 'cards':
									default:
										return <PropertyCard {...propertyProps} />;
								}
							})}
						</div>
					</div>
				)}

				{/* Step 3: Booking Summary */}
				{summary && selectedProperties.length > 0 && (
					<BookingSummary
						selectedProperties={selectedProperties}
						selectedExtras={selectedOptionalExtras}
						nights={form.nights}
						total={(summary.order_payable_now || 0) - (summary.order_surcharge || 0)}
						discountCode={discountCode}
						onDiscountCodeChange={setDiscountCode}
						onApplyDiscount={applyDiscountCode}
						checkInDate={form.date}
						summary={summary}
						showDiscount={showDiscount}
						showRedeemGiftCertificate={showRedeemGiftCertificate}
						giftCertificate={giftCertificate}
						onGiftCertificateChange={setGiftCertificate}
						showGiftCertificateForm={showGiftCertificateForm}
						onTriggerShowGiftCertificate={triggerShowGiftCertificate}
						onApplyGiftCertificate={applyGiftCertificate}
						gcResult={gcResult}
						gcLoading={gcLoading}
					/>
				)}

				{/* Step 4: Customer Details */}
				{summary && selectedProperties.length > 0 && (
					<CustomerDetails
						userDetails={userDetails}
						onUpdateDetails={updateUserDetails}
						formErrors={formErrors}
						showSuburb={showSuburb}
						showPostcode={showPostcode}
						showComments={showComments}
					/>
				)}

				{/* Step 5: Terms and Payment */}
				{summary && selectedProperties.length > 0 && (
					<div className="bif-terms-payment">
						<div className="bif-terms-checkbox">
							<input
								type="checkbox"
								id="agreeToTerms"
								checked={agreeToTerms}
								onChange={() => setAgreeToTerms(!agreeToTerms)}
							/>
							<label htmlFor="agreeToTerms">
								I have read and agree to the{" "}
								{summary.order_booking_conditions?.map((condition, index) => (
									<span key={index}>
										{condition.type === 'local' ? (
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													setModalCondition({
														isOpen: true,
														title: condition.title,
														content: condition.content
													});
												}}
												style={{ textDecoration: 'underline', cursor: 'pointer' }}
											>
												{condition.title}
											</a>
										) : (
											<a href={condition.url} target="_blank" rel="noopener noreferrer">
												{condition.title}
											</a>
										)}
										{index < summary.order_booking_conditions.length - 2 ? ", " : ""}
										{index === summary.order_booking_conditions.length - 2 ? " and " : ""}
									</span>
								))}
							</label>
							{formErrors.agreeToTerms && <div className="bif-field-error">{formErrors.agreeToTerms}</div>}
						</div>

						<div className="bif-privacy-consent">
							<input
								type="checkbox"
								id="consentToDataSharing"
								checked={consentToDataSharing}
								onChange={() => setConsentToDataSharing(!consentToDataSharing)}
							/>
							<label htmlFor="consentToDataSharing">
								I consent to my personal information being transmitted to and processed by Book It Fast (
								<a href="https://bookitfast.app/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
								) for booking and payment processing purposes.
							</label>
							{formErrors.consentToDataSharing && <div className="bif-field-error">{formErrors.consentToDataSharing}</div>}
						</div>

						{!showPaymentForm && (
							<div className="bif-payment-options">
								{Object.keys(formErrors).length > 0 && (
									<div className="bif-validation-error">
										Please complete all required fields before proceeding with payment.
									</div>
								)}

								{/* Check if gift certificate covers full amount */}
								{gcResult && gcResult.valid && (parseFloat(gcResult.total) - parseFloat(gcResult.gc_amount_applied)) === 0 ? (
									<div className="bif-gift-certificate-payment">
										<div className="bif-gift-certificate-full-coverage">
											<p>🎉 <strong>Your gift certificate covers the full booking amount!</strong></p>
											<p>No additional payment required.</p>
										</div>
										<button
											className="bif-btn bif-btn-primary bif-btn-large"
											onClick={() => handlePaymentOption("gift")}
										>
											🎁 Complete Booking with Gift Certificate
										</button>
									</div>
								) : (
									<>
										{/* Show surcharge info only if there's a remaining balance to pay with credit card */}
										{summary.order_surcharge > 0 && parseFloat(summary.order_payable_now || 0) > 0 && (
											<div className="bif-surcharge-info">
												<p>
													Please note a credit card surcharge applies of {summary.order_deposit_surcharge > 0 && ` $${summary.order_deposit_surcharge} for deposit or `}
													 ${summary.order_surcharge} for the full payment.
												</p>
											</div>
										)}

										{summary.order_deposit_amount > 0 ? (
											<div className="bif-payment-buttons">
												<button
													className="bif-btn bif-btn-primary"
													onClick={() => handlePaymentOption("deposit")}
												>
													💳 Pay Deposit (${summary.order_deposit_amount})
												</button>
																								<button
													className="bif-btn bif-btn-primary"
													onClick={() => handlePaymentOption("full")}
												>
													💳 Pay In Full (${gcResult && gcResult.valid
														? parseFloat(gcResult.order_payable_now).toFixed(2)
														: summary.order_payable_now
													})
												</button>
											</div>
																		) : (
																		<button
										className="bif-btn bif-btn-primary bif-btn-large"
										onClick={() => handlePaymentOption("full")}
									>
										💳 Complete Booking - ${gcResult && gcResult.valid
											? parseFloat(gcResult.order_payable_now).toFixed(2)
											: summary.order_payable_now
										}
									</button>
								)}
									</>
								)}
							</div>
						)}
					</div>
				)}

				{/* Payment Form */}
				{summary && showPaymentForm && (
					<div className="bif-payment-form-container">
						{selectedPaymentOption === "gift" ? (
							<PaymentForm
								summary={summary}
								propertyIds={propertyIdsString.split(',').map(id => parseInt(id.trim()))}
								userDetails={userDetails}
								paymentType={selectedPaymentOption}
								giftCertificate={gcResult}
							/>
						) : stripePromise && (
							<Elements stripe={stripePromise}>
								<PaymentForm
									summary={summary}
									propertyIds={propertyIdsString.split(',').map(id => parseInt(id.trim()))}
									userDetails={userDetails}
									paymentType={selectedPaymentOption}
									giftCertificate={gcResult}
								/>
							</Elements>
						)}
					</div>
				)}
			</div>

			{/* Booking Condition Modal */}
			<BookingConditionModal
				isOpen={modalCondition.isOpen}
				onClose={() => setModalCondition({ isOpen: false, title: '', content: '' })}
				title={modalCondition.title}
				content={modalCondition.content}
			/>
		</div>
	);
};

// Payment Form Component (keeping existing implementation)
const PaymentForm = ({ summary, propertyIds, userDetails, paymentType, giftCertificate }) => {
	const stripe = useStripe();
	const elements = useElements();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [paymentSuccess, setPaymentSuccess] = useState(false);
	const [receiptUrl, setReceiptUrl] = useState("");

	const handleSubmitPayment = async (event) => {
		event.preventDefault();

		setLoading(true);
		setError("");

		try {
			let payload = {
				amount: paymentType === "deposit" ? summary.order_deposit_amount : summary.order_payable_now,
				currency: "AUD",
				summary: summary,
				propertyIds: typeof propertyIds === 'string' ? propertyIds.split(',').map(id => parseInt(id.trim())) : propertyIds,
				userDetails: userDetails,
				paymentType: paymentType,
			};

			// Handle gift certificate payment (no Stripe needed)
			if (paymentType === "gift" && giftCertificate) {
				payload.giftCertificateApplied = true;
				payload.giftCertificate = giftCertificate;
				payload.amount = 0; // No credit card payment needed
			} else {
				// Handle credit card payment (Stripe required)
				if (!stripe || !elements) {
					console.error("Stripe.js has not loaded yet.");
					return;
				}

				const cardElement = elements.getElement(CardElement);
				const { paymentMethod, error } = await stripe.createPaymentMethod({
					type: "card",
					card: cardElement,
				});

				if (error) {
					console.error(error);
					setError(error.message);
					setLoading(false);
					return;
				}

				payload.stripePaymentMethodId = paymentMethod.id;

				// If gift certificate is partially applied, include it in the payload
				if (giftCertificate && giftCertificate.valid) {
					payload.giftCertificateApplied = true;
					payload.giftCertificate = giftCertificate;
				}
			}

			const response = await fetch(`${API_BASE}/bookitfast/v1/process-payment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const result = await response.json();

			if (result.success) {
				console.log("Payment successful:", result);
				setReceiptUrl(result.data.charge);
				setPaymentSuccess(true);
			} else {
				throw new Error(result.message || "Payment failed.");
			}
		} catch (err) {
			console.error("Payment error:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bif-payment-container">
			<h3>{paymentType === "gift" ? "🎁 Gift Certificate Payment" : "💳 Payment Details"}</h3>
			{error && <div className="bif-error-message">{error}</div>}
			{paymentSuccess ? (
				<div className="bif-success-message">
					<p><strong>✅ Payment Successful!</strong></p>
					{receiptUrl && (
						<p>
							<a href={receiptUrl} target="_blank" rel="noopener noreferrer">
								📄 Click here to view your receipt
							</a>
						</p>
					)}
				</div>
			) : paymentType === "gift" ? (
				<div className="bif-gift-certificate-payment-form">
					<div className="bif-gift-certificate-summary">
						<p>🎁 <strong>Paying with Gift Certificate</strong></p>
						<p>Amount: <strong>${parseFloat(giftCertificate.gc_amount_applied || 0).toFixed(2)}</strong></p>
						<p>No credit card required - your gift certificate will be charged automatically.</p>
					</div>
					<button
						onClick={handleSubmitPayment}
						disabled={loading}
						className="bif-btn bif-btn-primary bif-btn-large"
					>
						{loading ? "Processing..." : "Complete Booking"}
					</button>
				</div>
			) : (
				<form onSubmit={handleSubmitPayment} className="bif-stripe-form">
					<div className="bif-card-element-container">
						<CardElement
							options={{
								hidePostalCode: true,
								style: {
									base: {
										fontSize: "16px",
										color: "#424770",
										"::placeholder": {
											color: "#aab7c4",
										},
									},
									invalid: {
										color: "#9e2146",
									},
								},
							}}
						/>
					</div>
					<button
						type="submit"
						disabled={!stripe || loading}
						className="bif-btn bif-btn-primary bif-btn-large"
					>
						{loading ? "Processing..." : "Pay Now"}
					</button>
				</form>
			)}
		</div>
	);
};

export default MultiEmbedForm;
