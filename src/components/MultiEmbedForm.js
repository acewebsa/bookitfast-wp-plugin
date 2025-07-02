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

// Property Card Component
const PropertyCard = ({ property, isSelected, onToggle, nights, checkInDate }) => {
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
				{property.image_url && (
					<div className="bif-property-image">
						<img src={property.image_url} alt={property.property_name} />
					</div>
				)}

				{/* Property Info */}
				<div className="bif-property-info">
					<h3 className="bif-property-name">{property.property_name}</h3>
					{property.property_description && (
						<p className="bif-property-description">{property.property_description}</p>
					)}
				</div>

				{/* Status Badge - Top Right */}
				<div className="bif-property-status-container">
					<span className={`bif-property-status ${getStatusColor(isAvailable, property.availability?.availability_reason)}`}>
						{getStatusText(isAvailable, property.availability?.availability_reason, property.availability?.min_nights)}
					</span>
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
							<span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
							<span className="bif-total">Total: ${totalPrice}</span>
						</div>
					</div>
				</div>
			)}

			{/* Select Property Button - Bottom Right */}
			<div className="bif-property-actions">
				{isAvailable ? (
					<button
						onClick={onToggle}
						className={`bif-btn ${isSelected ? 'bif-btn-selected' : 'bif-btn-select'}`}
					>
						{isSelected ? '✓ Selected' : 'Select Property'}
					</button>
				) : (
					<button disabled className="bif-btn bif-btn-disabled">
						{getStatusText(isAvailable, property.availability?.availability_reason, property.availability?.min_nights)}
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
	);
};

// Date Selector Component
const DateSelector = ({ checkInDate, nights, onDateChange, onNightsChange, onCheckAvailability, isLoading }) => {
	const today = new Date().toISOString().split('T')[0];

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
						{[...Array(14).keys()].map(n => (
							<option key={n} value={n + 1}>
								{n + 1} {n + 1 === 1 ? 'night' : 'nights'}
							</option>
						))}
					</select>
				</div>

				<div className="bif-form-field">
					<button
						onClick={onCheckAvailability}
						disabled={!checkInDate || isLoading}
						className="bif-btn bif-btn-primary bif-check-availability"
					>
						{isLoading ? (
							<>
								<div className="bif-spinner"></div>
								<span>Checking...</span>
							</>
						) : (
							<span>Check Availability</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

// Booking Summary Component - Streamlined version
const BookingSummary = ({ selectedProperties, selectedExtras, nights, total, discountCode, onDiscountCodeChange, onApplyDiscount, checkInDate, summary }) => {
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
					// Fix: Use the correct property total from API
					const propertySubtotal = property.availability?.total_cost ||
						(property.availability?.dates?.reduce((sum, date) => sum + (date.rate || 0), 0) || 0);

										// Calculate mandatory extras total
					const mandatoryExtrasTotal = property.mandatory_extras?.reduce((sum, extra) => sum + parseFloat(extra.amount || 0), 0) || 0;

					// Calculate property total (subtotal + mandatory extras) - ensure both are numbers
					const propertyTotal = parseFloat(propertySubtotal) + parseFloat(mandatoryExtrasTotal);

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

							{/* Property Total (Subtotal + Mandatory Extras) */}
							<div className="bif-property-total">
								<div className="bif-total-row bif-subtotal">
									<span>Property Total</span>
									<span>${parseFloat(propertyTotal).toFixed(2)}</span>
								</div>
							</div>

							{/* Show selected optional extras for this property */}
							{selectedExtras[property.id] && selectedExtras[property.id].length > 0 && (
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

								{/* Grand Total */}
				<div className="bif-grand-total">
					<div className="bif-total-main">
						<span>Total Cost</span>
						<span className="bif-total-amount">${parseFloat(total).toFixed(2)}</span>
					</div>
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

// Customer Details Component - Remove emoji icons
const CustomerDetails = ({ userDetails, onUpdateDetails, formErrors }) => {
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

				<div className="bif-form-row">
					<div className="bif-form-field">
						<label>Postcode</label>
						<input
							type="text"
							value={userDetails.postcode}
							onChange={(e) => onUpdateDetails('postcode', e.target.value)}
							placeholder="Enter your postcode"
						/>
					</div>

					<div className="bif-form-field">
						<label>Suburb</label>
						<input
							type="text"
							value={userDetails.suburb}
							onChange={(e) => onUpdateDetails('suburb', e.target.value)}
							placeholder="Enter your suburb"
						/>
					</div>
				</div>

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
}) => {
	const nightsFromUrl = getQueryParam('nights');
	const validatedNights = nightsFromUrl && !isNaN(nightsFromUrl) ? parseInt(nightsFromUrl, 10) : 1;

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
	const [discountCode, setDiscountCode] = useState(discountCodeFromUrl);
	const [discountMessage, setDiscountMessage] = useState(null);
	const [showPaymentForm, setShowPaymentForm] = useState(false);
	const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
	const [formErrors, setFormErrors] = useState({});
	const [giftCertificate, setGiftCertificate] = useState({ number: "", pin: "" });
	const [showGiftCertificateForm, setShowGiftCertificateForm] = useState(false);
	const [gcResult, setGcResult] = useState(null);
	const [selectedOptionalExtras, setSelectedOptionalExtras] = useState({});
	const [showProperties, setShowProperties] = useState(false);

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

		console.log("Requesting availability with:", {
			ids: propertyIdsArray,
			start: formattedStartDate,
			nights: nights,
		});

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

	const validateCustomerDetails = () => {
		const errors = {};
		if (!userDetails.firstName.trim()) errors.firstName = 'First name is required';
		if (!userDetails.lastName.trim()) errors.lastName = 'Last name is required';
		if (!userDetails.email.trim()) errors.email = 'Email is required';
		if (!userDetails.phone.trim()) errors.phone = 'Phone is required';
		if (!agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';

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

	// Get selected properties for display
	const selectedProperties = availability ?
		Object.entries(availability)
			.filter(([propertyId]) => selectionData[propertyId])
			.map(([propertyId, propertyData]) => ({
				id: propertyId,
				...propertyData,
				selectedExtras: selectedOptionalExtras[propertyId],
				onToggleExtra: toggleOptionalExtra
			})) : [];

	return (
		<div className="bif-booking-container">
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
				/>

				{error && <div className="bif-error-message">{error}</div>}

				{/* Step 2: Property Selection */}
				{showProperties && availability && (
					<div className="bif-property-list">
						<h2 className="bif-section-title">Available Properties</h2>
						<div className="bif-properties">
							{Object.entries(availability).map(([propertyId, propertyData]) => (
								<PropertyCard
									key={propertyId}
									property={{
										id: propertyId,
										...propertyData,
										selectedExtras: selectedOptionalExtras[propertyId],
										onToggleExtra: toggleOptionalExtra
									}}
									isSelected={selectionData[propertyId]}
									onToggle={() => toggleSelection(propertyId)}
									nights={form.nights}
									checkInDate={form.date}
								/>
							))}
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
					/>
				)}

				{/* Step 4: Customer Details */}
				{summary && selectedProperties.length > 0 && (
					<CustomerDetails
						userDetails={userDetails}
						onUpdateDetails={updateUserDetails}
						formErrors={formErrors}
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
										<a href={condition.url} target="_blank" rel="noopener noreferrer">
											{condition.title}
										</a>
										{index < summary.order_booking_conditions.length - 2 ? ", " : ""}
										{index === summary.order_booking_conditions.length - 2 ? " and " : ""}
									</span>
								))}
							</label>
							{formErrors.agreeToTerms && <div className="bif-field-error">{formErrors.agreeToTerms}</div>}
						</div>

						{!showPaymentForm && (
							<div className="bif-payment-options">
								{Object.keys(formErrors).length > 0 && (
									<div className="bif-validation-error">
										Please complete all required fields before proceeding with payment.
									</div>
								)}

																{summary.order_surcharge > 0 && (
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
											💳 Pay In Full (${summary.order_payable_now})
										</button>
									</div>
								) : (
									<button
										className="bif-btn bif-btn-primary bif-btn-large"
										onClick={() => handlePaymentOption("full")}
									>
										💳 Complete Booking - ${summary.order_payable_now}
									</button>
								)}
							</div>
						)}
					</div>
				)}

				{/* Payment Form */}
				{stripePromise && summary && showPaymentForm && (
					<div className="bif-payment-form-container">
						<Elements stripe={stripePromise}>
							<PaymentForm
								summary={summary}
								propertyIds={propertyIdsString.split(',').map(id => parseInt(id.trim()))}
								userDetails={userDetails}
								paymentType={selectedPaymentOption}
								giftCertificate={selectedPaymentOption === "gift" ? gcResult : null}
							/>
						</Elements>
					</div>
				)}
			</div>
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

		if (!stripe || !elements) {
			console.error("Stripe.js has not loaded yet.");
			return;
		}

		setLoading(true);
		setError("");

		const cardElement = elements.getElement(CardElement);
		try {
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

			const amount = paymentType === "deposit" ? summary.order_deposit_amount : summary.order_payable_now;

			const payload = {
				stripePaymentMethodId: paymentMethod.id,
				amount: amount,
				currency: "AUD",
				summary: summary,
				propertyIds: typeof propertyIds === 'string' ? propertyIds.split(',').map(id => parseInt(id.trim())) : propertyIds,
				userDetails: userDetails,
				paymentType: paymentType,
			};

			if (paymentType === "gift" && giftCertificate) {
				payload.giftCertificateApplied = true;
				payload.giftCertificate = giftCertificate;
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
			<h3>💳 Payment Details</h3>
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
