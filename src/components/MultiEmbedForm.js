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

const MultiEmbedForm = ({
							propertyIds = '',
							showDiscount = false,
							// Ensure postcode and suburb are shown as these are required
							showSuburb = true,
							showPostcode = true,
							showRedeemGiftCertificate = false,
							showComments = false,
						}) => {
	const nightsFromUrl = getQueryParam('nights');
	const validatedNights = nightsFromUrl && !isNaN(nightsFromUrl) ? parseInt(nightsFromUrl, 10) : 1;

	// Extract and validate "start" date from URL
	const startDateFromUrl = getQueryParam('start');
	const discountCodeFromUrl = getQueryParam('discount');
	const validatedStartDate = startDateFromUrl ? parseDateFromUrl(startDateFromUrl) : '';

	// Ensure propertyIds is a string and handle it properly
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
	const [applyingDiscount, setApplyingDiscount] = useState(false);
	const [paymentSuccess, setPaymentSuccess] = useState(false);

	// New states for payment option and validation
	const [showPaymentForm, setShowPaymentForm] = useState(false);
	const [selectedPaymentOption, setSelectedPaymentOption] = useState(null); // "deposit" or "full"
	const [formErrors, setFormErrors] = useState({});

	const [giftCertificate, setGiftCertificate] = useState({ number: "", pin: "" });
	const [showGiftCertificateForm, setShowGiftCertificateForm] = useState(false);
	const [gcResult, setGcResult] = useState(null);
	const [selectedOptionalExtras, setSelectedOptionalExtras] = useState({});

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

			// Initialise selectionData for each property
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

			// Initialise Stripe if publishable key provided
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
	const applyDiscountCode = async () => {
		if (!discountCode) return;

		setApplyingDiscount(true);
		setDiscountMessage(null);

		try {
			const response = await fetch(`${API_BASE}/bookitfast/v1/multi/availability/apply-discount`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					discount_code: discountCode,
					start: form.date,
					nights: form.nights,
					property_ids: Object.keys(selectionData).filter(id => selectionData[id]),
				}),
			});

			const data = await response.json();

			if (data.success) {
				setSummary(data.summary);
				setDiscountMessage({ success: true, message: "Discount applied successfully!" });
			} else {
				setDiscountMessage({ success: false, message: data.message || "Invalid discount code." });
			}
		} catch (err) {
			console.error("Error applying discount:", err);
			setDiscountMessage({ success: false, message: "Error applying discount. Please try again." });
		} finally {
			setApplyingDiscount(false);
		}
	};

	// Validate customer details before proceeding with payment
	const validateCustomerDetails = () => {
		const errors = {};
		if (!userDetails.firstName.trim()) errors.firstName = "First name is required.";
		if (!userDetails.lastName.trim()) errors.lastName = "Last name is required.";
		if (!userDetails.phone.trim()) errors.phone = "Phone is required.";
		if (!userDetails.email.trim()) errors.email = "Email is required.";
		if (showPostcode && !userDetails.postcode.trim()) errors.postcode = "Postcode is required.";
		if (showSuburb && !userDetails.suburb.trim()) errors.suburb = "Suburb is required.";
		if (!agreeToTerms) errors.agreeToTerms = "You must agree to the terms and conditions.";

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Handle payment option selection (deposit/full)
	const handlePaymentOption = (option) => {
		if (validateCustomerDetails()) {
			setSelectedPaymentOption(option);
			setShowPaymentForm(true);
		} else {
			// Scroll to the bottom to show validation errors
			window.scrollTo(0, document.body.scrollHeight);
		}
	};

// Trigger display of gift certificate form
	const triggerShowGiftCertificate = () => {
		setShowGiftCertificateForm(true);
	};

	// Apply gift certificate via POST request
	const applyGiftCertificate = async (e) => {
		e.preventDefault();
		if (!summary) return;
		const data = {
			certificate: giftCertificate,
			summary: summary
		};
		try {
			const response = await fetch(`${API_BASE}/bookitfast/v1/apply-gift-certificate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			const responseData = await response.json();
			setGcResult(responseData);
			// Update summary with new totals and set order_payable_now to the new grand total
			/*setSummary(prev => ({
				...prev,
				grand_total: responseData.order_grand_total,
				surcharge: responseData.new_surcharge,
				order_payable_now: responseData.order_payable_now,

			}));*/
			setSummary(responseData.summary);
		} catch (err) {
			console.error("Error applying gift certificate", err);
		}
	};

// New function to submit an order when the gift certificate covers the full balance.
	const submitOrderNoPayment = async () => {
		try {
			setLoading(true);
			console.log('Submit Order With Gift Certificate...');
			const response = await fetch(`${API_BASE}/process-payment`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					giftCertificateApplied: true,
					giftCertificate: gcResult,
					summary: summary,
					propertyIds: Object.keys(selectionData).filter(id => selectionData[id]),
					userDetails: userDetails,
					amount: 0 // no additional payment required
				}),
			});
			const result = await response.json();
			if (result.success) {
				console.log("Payment successful:", result);
			//	setReceiptUrl(result.data.charge);
				setPaymentSuccess(true);
			} else {
				setError(result.message || "Order submission failed.");
			}



		} catch (err) {
			console.error("Order submission error:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

// Render gift certificate redemption section
	const renderGiftCertificateSection = () => {
		if (!showRedeemGiftCertificate || !summary) return null;
		return (
			<div id="bookitfast_gift_certificates">
				<button className="btn btn-success" onClick={(e) => { e.preventDefault(); triggerShowGiftCertificate(); }}>
					Apply Gift Certificate
				</button>
				{showGiftCertificateForm && (
					<div className="bookitfast-container">

						<form id="bookitfast_enter_gift_certificate" className="bookitfast-certificate-form">
							<div className="form-group form-row">
								<label>Certificate Number:</label>
								<input
									type="text"
									value={giftCertificate.number}
									onChange={(e) => setGiftCertificate({ ...giftCertificate, number: e.target.value })}
									className="form-control"
								/>
							</div>
							<div className="form-group form-row">
								<label>Pin:</label>
								<input
									type="number"
									value={giftCertificate.pin}
									onChange={(e) => setGiftCertificate({ ...giftCertificate, pin: e.target.value })}
									className="form-control"
								/>
							</div>
							<div className="form-row">
								<button className="btn btn-success" onClick={applyGiftCertificate}>
									Apply
								</button>
							</div>
						</form>
						{gcResult && gcResult.valid && gcResult.amount_remaining > 0 && (
							<div className="alert alert-success form-row">
								<p>Successfully Applied Gift Certificate</p>
								<p>An amount of ${gcResult.gc_amount_applied} has been applied to your order</p>
								<p>Your Gift Certifcate will have a balance of ${gcResult.gc_balance_after_order} after the order is placed.</p>
							</div>
						)}
					</div>
				)}
			</div>
		);
	};
	const renderDiscountCode = () => {
		return (
			<div className="bookitfast-container bif-mt-2 discount-code-container">
				<div className="discount-code-row">
					<label htmlFor="discountCode" className="discount-label">Discount Code:</label>
					<div className="form-group">
						<input
							type="text"
							id="discountCode"
							value={discountCode}
							onChange={(e) => setDiscountCode(e.target.value)}
							className="discount-input"
							placeholder="Enter discount code"
						/>
						<button
							className="btn btn-primary apply-discount-btn"
							onClick={() => fetchSummary(selectionData, discountCode)}
							disabled={!discountCode}
						>
							Apply Discount
						</button>
					</div>
				</div>
				{discountMessage && (
					<p className={`discount-message ${discountMessage.success ? "success" : "error"}`}>
						{discountMessage.message}
					</p>
				)}
			</div>
		);
	};

	const renderAvailabilityTable = () => {
		if (!availability || Object.keys(availability).length === 0) {
			return <p>No availability data found.</p>;
		}

		return Object.entries(availability).map(([propertyId, propertyData]) => {
			const { property_name, availability: propertyAvailability } = propertyData;

			return (
				<div key={propertyId} className="bookitfast_availability_grid_div">
					<h3>{property_name}</h3>
					<div className={'availability_button alignright'}>
						{propertyAvailability.available ? (
							<button
								className={`btn ${selectionData[propertyId] ? 'btn-success' : 'btn-primary'}`}
								onClick={() => toggleSelection(propertyId)}
							>
								{selectionData[propertyId] ? 'Selected' : 'Click to Select'}
							</button>
						) : (
							<button className="btn btn-danger" disabled>
								Not Available
							</button>
						)}
					</div>
					<table className="availability_table">
						<thead>
						<tr>
							<th className="availability_table_header">Date</th>
							<th className="availability_table_header">Status</th>
							<th className="availability_table_header">Price</th>
						</tr>
						</thead>
						<tbody>
						{propertyAvailability.dates.map((date, index) => (
							<tr
								key={index}
								className={`bookitfast_day_row ${date.availability ? 'cell_date_available' : 'cell_date_unavailable'}`}
							>
								<td className="bookitfast_day">{date.date_formatted}</td>
								<td className="bookitfast_availability_cell">
									<div>
										{date.availability_reason === 'Min Nights' && `Min Nights ${date.min_nights}`}
										{date.availability_reason === 'Booked Out' && 'Booked Out'}
										{date.availability_reason === 'No Tariff Set' && 'Rates Not Available'}
										{date.availability_reason === 'Available' && 'Available'}
									</div>
								</td>
								<td>
									<div className="avail_rate">
										{date.rate ? `$${date.rate}` : '-'}
									</div>
								</td>
							</tr>
						))}
						</tbody>
					</table>
					{propertyData.optional_extras?.length > 0 && selectionData[propertyId] && (
						<div className="optional_extras">
							<h4 >Optional Extras</h4>
							{propertyData.optional_extras.map((optionalExtra) => (
								<div key={optionalExtra.id} className="property_summary_detail_row property_summary_item_body_section bookitfast_optional_extra">
									<div><input
										type="checkbox"
										checked={selectedOptionalExtras[propertyId]?.[optionalExtra.id] || false}
										onChange={() => toggleOptionalExtra(propertyId, optionalExtra.id)}
									/><label>{optionalExtra.description}</label></div>
									<div>${optionalExtra.amount}</div>

								</div>
							))}
						</div>
					)}
				</div>
			);
		});
	};

	const renderTermsCheckbox = () => {
		if (!summary || !summary.order_booking_conditions || summary.order_booking_conditions.length === 0) {
			return null;
		}

		const conditions = summary.order_booking_conditions.map(condition => condition.title);
		const formattedConditions = conditions.length > 1
			? conditions.slice(0, -1).join(", ") + " and " + conditions[conditions.length - 1]
			: conditions[0];

		return (
			<div className="terms-checkbox bookitfast-text">
				<input
					type="checkbox"
					id="agreeToTerms"
					checked={agreeToTerms}
					onChange={() => setAgreeToTerms(!agreeToTerms)}
				/>
				<label htmlFor="agreeToTerms">
					I have read and agree to the{" "}
					{summary.order_booking_conditions.map((condition, index) => (
						<span key={index}>
							<a href={condition.url} target="_blank" rel="noopener noreferrer">
								{condition.title}
							</a>
							{index < summary.order_booking_conditions.length - 2 ? ", " : ""}
							{index === summary.order_booking_conditions.length - 2 ? " and " : ""}
						</span>
					))}
				</label>
				{formErrors.agreeToTerms && <p className="error-text">{formErrors.agreeToTerms}</p>}
			</div>
		);
	};

	const renderCustomerForm = () => {
		return (
			<div className="user-details-form">
				<h3>Your Details</h3>
				<form>
					<div className="form-group form-row">
						<label htmlFor="firstName">First Name:</label>
						<input
							type="text"
							id="firstName"
							className="form-control"
							value={userDetails.firstName}
							onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
						/>

					</div>{formErrors.firstName && <div className="alert alert-danger">{formErrors.firstName}</div>}
					<div className="form-group form-row">
						<label htmlFor="lastName">Last Name:</label>
						<input
							type="text"
							id="lastName"
							className="form-control"
							value={userDetails.lastName}
							onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
						/>
					</div>
					{formErrors.lastName && <div className="alert alert-danger">{formErrors.lastName}</div>}

					<div className="form-group form-row">
						<label htmlFor="phone">Phone:</label>
						<input
							type="tel"
							id="phone"
							className="form-control"
							value={userDetails.phone}
							onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
						/>

					</div>{formErrors.phone && <div className="alert alert-danger">{formErrors.phone}</div>}
					<div className="form-group form-row">
						<label htmlFor="email">Email:</label>
						<input
							type="email"
							id="email"
							className="form-control"
							value={userDetails.email}
							onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
						/>

					</div>{formErrors.email && <div className="alert alert-danger">{formErrors.email}</div>}
					{showPostcode && (
						<div>
							<div className="form-group form-row">
								<label htmlFor="postcode">Postcode:</label>
								<input
									type="text"
									id="postcode"
									className="form-control"
									value={userDetails.postcode}
									onChange={(e) => setUserDetails({ ...userDetails, postcode: e.target.value })}
								/>

							</div>{formErrors.postcode && <div className="alert alert-danger">{formErrors.postcode}</div>}
						</div>

					)}
					{showSuburb && (
						<div>
							<div className="form-group form-row">
								<label htmlFor="suburb">Suburb:</label>
								<input
									type="text"
									id="suburb"
									className="form-control"
									value={userDetails.suburb}
									onChange={(e) => setUserDetails({ ...userDetails, suburb: e.target.value })}
								/>

							</div>{formErrors.suburb && <div className="alert alert-danger">{formErrors.suburb}</div>}
						</div>

					)}
					{showComments && (
						<div className="form-group form-row">
							<label htmlFor="comments">Comments:</label>
							<textarea
								id="comments"
								className="form-control"
								value={userDetails.comments}
								onChange={(e) => setUserDetails({ ...userDetails, comments: e.target.value })}
							/>
						</div>
					)}
				</form>
			</div>
		);
	};

	const renderBookingSummary = () => {
		if (!summary || !summary.property_summaries) {
			return null;
		}

		return (
			<div className="bookitfast-container">
				<h3 className="aligncenter centered">Property Booking Summary</h3>
				{Object.entries(summary.property_summaries).map(([propertyId, property]) => (
					<div key={propertyId} className="property_summary_item">
						<h4 className="property_summary_item_title">{property.name}</h4>
						<div className="property_summary_item_body">
							<div className="property_summary_detail_row property_summary_item_body_section">
								<div>Subtotal:</div>
								<div>${property.sub_total}</div>
							</div>
							{property.mandatory_extras?.length > 0 && (
								<div className="bookitfast_extras">
									<h4 className="property_summary_sub_heading property_summary_item_body_section">Mandatory Extras Included</h4>
									{property.mandatory_extras.map((extra) => (
										<div key={extra.id} className="property_summary_detail_row property_summary_item_body_section">
											<div>{extra.description}</div>
											<div>${extra.amount}</div>
										</div>
									))}
								</div>
							)}
							{property.optional_extras?.length > 0 && (
								<div className="optional_extras">
									<h4 className="property_summary_sub_heading property_summary_item_body_section">Optional Extras Included</h4>
									{property.optional_extras.map((optionalExtra) => (
										<div key={optionalExtra.id} className="property_summary_detail_row property_summary_item_body_section">
											<div>{optionalExtra.description}</div>
											<div>${optionalExtra.amount}</div>
										</div>
									))}
								</div>
							)}
							{(property.last_minute_discount > 0 || property.discount_code_rate_applies) && (
								<div className="discounts">
									<h4 className="property_summary_sub_heading property_summary_item_body_section">Discounts</h4>
									{property.last_minute_discount > 0 && (
										<div className="property_summary_detail_row property_summary_item_body_section">
											<div>Last Minute Discount</div>
											<div>-${property.last_minute_discount}</div>
										</div>
									)}
									{property.discount_code_rate_applies && (
										<div className="property_summary_detail_row property_summary_item_body_section">
											<div>Discount Code</div>
											<div>-${property.discount_code_discount}</div>
										</div>
									)}
								</div>
							)}
							<div className="property_summary_detail_row bookitfast_total_cost property_summary_item_body_section">
								<div>Total Cost</div>
								<div>${property.grand_total}</div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	};

	return (
		<div>
			<div className="bookitfast-container">
				<div className="form-inline" id="bookitfastbooking">
					<div className="form-group">
						<label>Check-In Date:</label>
						<input
							type="date"
							value={form.date}
							onChange={(e) => {
								const newDate = e.target.value;
								console.log("New selected date:", newDate);
								setForm({ ...form, date: newDate });
							}}
							className="form-control"
						/>
					</div>
					<div className="form-group">
						<label>Number of Nights:</label>
						<select
							value={form.nights}
							onChange={(e) => setForm({ ...form, nights: parseInt(e.target.value) })}
							className="form-control"
						>
							{[...Array(14).keys()].map((n) => (
								<option key={n} value={n + 1}>
									{n + 1} night{n + 1 > 1 ? 's' : ''}
								</option>
							))}
						</select>
					</div>
					<div className="form-group bif-availability-button-container">
						<button className="btn btn-success" onClick={fetchAvailability} disabled={!form.date || loading}>
							{loading ? 'Checking...' : 'Check Availability'}
						</button>
					</div>
				</div>
				{error && <p className="alert alert-danger">{error}</p>}
			</div>
			{availability && renderAvailabilityTable()}
			{summary && renderDiscountCode()}
			{summary && renderGiftCertificateSection()}
			{summary && renderBookingSummary()}
			{summary && renderCustomerForm()}
			{summary && renderTermsCheckbox()}
			{/* Payment Options Section */}
			{summary && !showPaymentForm && (
				<div className="payment-options">
					{Object.keys(formErrors).length > 0 && (
						<div className="alert alert-danger">
							Please rectify the highlighted errors before proceeding with payment.
						</div>
					)}
					{/* If a valid gift certificate has been applied, show its payment options */}
					{gcResult && gcResult.valid ? (
						<div className="gift-certificate-payment-option">
							{summary.order_payable_now === 0 ? (
								<button className="btn btn-success btn-rounded" onClick={submitOrderNoPayment}>
									Pay in full with Gift Certificate
								</button>
							) : (
								<button className="btn btn-success btn-rounded" onClick={() => handlePaymentOption("gift")}>
									Apply Gift Certificate and Pay ${summary.order_payable_now}
								</button>
							)}
						</div>
					) : null}
					{/* Fallback options if no gift certificate is applied */}
					{(!gcResult || !gcResult.valid) && (
						summary.order_deposit_amount > 0 ? (
							<div>
								<button className="btn btn-primary mr-6" onClick={() => handlePaymentOption("deposit")}>
									Pay Deposit (${summary.order_deposit_amount})
								</button>
								<button className="btn btn-primary" onClick={() => handlePaymentOption("full")}>
									Pay In Full (${summary.order_payable_now})
								</button>
							</div>
						) : (
							<button className="btn btn-primary" onClick={() => handlePaymentOption("full")}>
								Pay Now (${summary.order_payable_now})
							</button>
						)
					)}
					{summary.order_surcharge > 0 && (
						<div className="surcharge-info">
							<p>
								Please note a credit card surcharge applies of
								{summary.order_deposit_surcharge > 0 ? (
									<> ${summary.order_deposit_surcharge} for deposit or </>
								) : null}
								${summary.order_surcharge} for the full payment.
							</p>
						</div>
					)}
				</div>
			)}
			{stripePromise && summary && showPaymentForm && (
				<div className="bookitfast-container">
					<Elements stripe={stripePromise}>
						<PaymentForm
							summary={summary}
							propertyIds={typeof propertyIds === 'string' ? propertyIds.split(',').map(id => parseInt(id.trim())) : propertyIds}
							userDetails={userDetails}
							paymentType={selectedPaymentOption}
							giftCertificate={selectedPaymentOption === "gift" ? gcResult : null}
						/>
					</Elements>
				</div>
			)}
		</div>
	);
};


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

			// Determine the amount based on the payment type
			const amount = paymentType === "deposit" ? summary.order_deposit_amount : summary.order_payable_now;

			// Build the payload
			const payload = {
				stripePaymentMethodId: paymentMethod.id,
				amount: amount,
				currency: "AUD",
				summary: summary,
				propertyIds: typeof propertyIds === 'string' ? propertyIds.split(',').map(id => parseInt(id.trim())) : propertyIds,
				userDetails: userDetails,
				paymentType: paymentType,
			};

			// If paying with a gift certificate (partial payment), include its details
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
		<div className="payment-container">
			<h3>Payment Details</h3>
			{error && <p className="alert alert-danger">{error}</p>}
			{paymentSuccess ? (
				<div className="alert alert-success">
					<p><strong>Payment Successful!</strong></p>
					{receiptUrl && (
						<p>
							<a href={receiptUrl} target="_blank" rel="noopener noreferrer">
								Click here to view your receipt.
							</a>
						</p>
					)}
				</div>
			) : (
				<form onSubmit={handleSubmitPayment}>
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
					<button type="submit" disabled={!stripe || loading} className="btn btn-primary">
						{loading ? "Processing..." : "Pay Now"}
					</button>
				</form>
			)}
		</div>
	);
};

export default MultiEmbedForm;
