import { useState, useEffect } from 'react';

const MultiEmbedForm = ({
							propertyIds = '',
							showDiscount = false,
							showSuburb = false,
							showPostcode = false,
							showRedeemGiftCertificate = false,
							showComments = false,
						}) => {
	const [form, setForm] = useState({ date: '', nights: 1 });
	const [availability, setAvailability] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [stripePromise, setStripePromise] = useState(null);
	const [summary, setSummary] = useState(null);
	console.log(propertyIds);
	// Fetch availability data
	const fetchAvailability = async () => {
		if (!form.date || !propertyIds) {
			console.error("Missing date or propertyIds:", form.date, propertyIds);
			return;
		}

		// Ensure propertyIds is an array
		const formattedIds = propertyIds
			.split(',')
			.map(id => id.trim())  // Remove spaces
			.filter(id => id !== '');  // Remove empty values

		console.log("Fetching availability for IDs:", formattedIds); // Debugging

		setLoading(true);
		setError('');
		try {
			const response = await fetch('https://bookitfastfilament.test/api/multi/availability/get_json', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ids: propertyIds, // Use propertyIds from props
					start: form.date,
					nights: form.nights,
				}),
			});
			const data = await response.json();
			setAvailability(data); // Store the response in state
		} catch (err) {
			console.error(err);
			setError('Failed to fetch availability. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Render availability grid
	const renderAvailabilityGrid = () => {
		if (!availability || Object.keys(availability).length === 0) {
			return <p>No availability data found.</p>;
		}

		return Object.entries(availability).map(([propertyId, propertyData]) => {
			const { property_name, availability: propertyAvailability } = propertyData;

			return (
				<div key={propertyId} className="bookitfast_availability_grid_div">
					{/* Property Title */}
					<div className="property_heading_container">
						<h2>{property_name}</h2>
						<p>Available: {propertyAvailability.available ? 'Yes' : 'No'}</p>
					</div>

					{/* Availability Dates Grid */}
					<div className="availability_grid">
						{propertyAvailability.dates.length > 0 ? (
							propertyAvailability.dates.map((availDate, index) => (
								<div
									key={index}
									className={`bookitfast_day_cell ${
										availDate.availability ? 'cell_date_available' : 'cell_date_unavailable'
									}`}
								>
									<div className="bookitfast_day">{availDate.date_formatted}</div>
									<div className="bookitfast_availability_cell">
                                        <span>
                                            {availDate.availability_reason === 'Min Nights' && (
												<>Min Nights {availDate.min_nights}</>
											)}
											{availDate.availability_reason === 'Booked Out' && <>Booked Out</>}
											{availDate.availability_reason === 'No Tariff Set' && <>Rates Not<br />Available</>}
											{!availDate.availability_reason && <>Available</>}
                                        </span>
										<span className="avail_rate">
                                            {availDate.rate ? `$${availDate.rate}` : '-'}
                                        </span>
									</div>
								</div>
							))
						) : (
							<p>No dates available.</p>
						)}
					</div>

					{/* Mandatory Extras */}
					{propertyAvailability.mandatory_extras.length > 0 && (
						<div className="mandatory_extras">
							<h4>Mandatory Extras:</h4>
							{propertyAvailability.mandatory_extras.map((extra) => (
								<p key={extra.id}>
									{extra.description} - ${extra.amount}
								</p>
							))}
						</div>
					)}

					{/* Optional Extras */}
					{propertyAvailability.optional_extras.length > 0 && (
						<div className="optional_extras">
							<h4>Optional Extras:</h4>
							{propertyAvailability.optional_extras.map((extra) => (
								<p key={extra.id}>
									{extra.description} - ${extra.amount}{' '}
									<button className="btn btn-primary">Add</button>
								</p>
							))}
						</div>
					)}
				</div>
			);
		});
	};

	return (
		<div className="bookitfast-container">
			<div className="form-inline" id="bookitfastbooking">
				{/* Form Inputs */}
				<div className="form-group">
					<label>Check-In Date:</label>
					<input
						type="date"
						value={form.date}
						onChange={(e) => setForm({ ...form, date: e.target.value })}
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
				<div className="form-group">
					<button className="btn btn-success" onClick={fetchAvailability} disabled={!form.date || loading}>
						{loading ? 'Checking...' : 'Check Availability'}
					</button>
				</div>

				{/* Optional Fields */}
				{showDiscount && <div className="form-group">Discount field here...</div>}
				{showSuburb && <div className="form-group">Suburb field here...</div>}
				{showPostcode && <div className="form-group">Postcode field here...</div>}
				{showRedeemGiftCertificate && (
					<div className="form-group">Redeem Gift Certificate section here...</div>
				)}
				{showComments && <div className="form-group">Comments field here...</div>}
			</div>

			{/* Availability Grid */}
			{error && <p className="alert alert-danger">{error}</p>}
			<div id="bookitfast">{renderAvailabilityGrid()}</div>
		</div>
	);
};

export default MultiEmbedForm;
