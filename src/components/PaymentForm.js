import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PaymentForm = ({ summary, propertyIds }) => {
	const stripe = useStripe();
	const elements = useElements();
	const [paymentProcessing, setPaymentProcessing] = useState(false);
	const [loading, setLoading] = useState(false);  // ✅ Add local state for loading
	const [error, setError] = useState("");         // ✅ Add local state for error

	const handleSubmit = async (event) => {
		event.preventDefault();
		setPaymentProcessing(true);
		setError(null);

		if (!stripe || !elements) {
			setError("Stripe has not been initialized.");
			setPaymentProcessing(false);
			return;
		}

		const cardElement = elements.getElement(CardElement);
		const { error, paymentMethod } = await stripe.createPaymentMethod({
			type: "card",
			card: cardElement,
		});

		if (error) {
			setError(error.message);
			setPaymentProcessing(false);
			return;
		}

		console.log("PaymentMethod created:", paymentMethod);
		setPaymentProcessing(false);
	};

	return (
		<div className="payment-container">
			<h3>Payment Details</h3>
			<form onSubmit={handleSubmit}>
				<CardElement
					options={{
						hidePostalCode: true, // **Hides ZIP/Postcode field**
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
				<button type="submit" disabled={paymentProcessing}>
					{paymentProcessing ? "Processing..." : "Pay Now"}
				</button>
			</form>
			{error && <p className="error-message">{error}</p>}
		</div>
	);
};

export default PaymentForm;
