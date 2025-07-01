import React, { useState } from "react";
import ReactDOM from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import '../assets/frontend.css';
// Gift certificate frontend functionality only

// Form validation function
function validateForm() {
    const fields = [
        { id: 'gc_amount', name: 'Amount' },
        { id: 'gc_to', name: 'To' },
        { id: 'gc_from', name: 'From' },
        { id: 'gc_message', name: 'Message' },
        { id: 'recipient_first_name', name: 'Recipient First Name' },
        { id: 'recipient_last_name', name: 'Recipient Last Name' },
        { id: 'customer_first_name', name: 'Your First Name' },
        { id: 'customer_last_name', name: 'Your Last Name' },
        { id: 'customer_phone', name: 'Your Phone' },
        { id: 'customer_email', name: 'Your Email' },
    ];

    let isValid = true;
    let errorMessages = [];

    fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element.value.trim()) {
            isValid = false;
            errorMessages.push(`${field.name} is required.`);
            element.classList.add('is-invalid');
        } else {
            element.classList.remove('is-invalid');
        }
    });

    // Additional validation for email and phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(document.getElementById('customer_email').value.trim())) {
        isValid = false;
        errorMessages.push('Please enter a valid email address.');
        document.getElementById('customer_email').classList.add('is-invalid');
    }

    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phoneRegex.test(document.getElementById('customer_phone').value.trim())) {
        isValid = false;
        errorMessages.push('Please enter a valid phone number.');
        document.getElementById('customer_phone').classList.add('is-invalid');
    }

    return { isValid, errorMessages };
}

// Payment form component using Stripe Elements.
function GiftCertificatePaymentForm({ stripePk, totalAmount, surcharge, onPaymentSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError("");
        setSuccess("");

        const cardElement = elements.getElement(CardElement);
        try {
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
            });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            // Retrieve additional form fields from the DOM.
            const gcAmount = document.getElementById("gc_amount").value;
            const gcTo = document.getElementById("gc_to").value;
            const gcFrom = document.getElementById("gc_from").value;
            const gcMessage = document.getElementById("gc_message").value;
            const recipientFirstName = document.getElementById("recipient_first_name").value;
            const recipientLastName = document.getElementById("recipient_last_name").value;
            const customerFirstName = document.getElementById("customer_first_name").value;
            const customerLastName = document.getElementById("customer_last_name").value;
            const customerPhone = document.getElementById("customer_phone").value;
            const customerEmail = document.getElementById("customer_email").value;

            // Build the payload.
            const payload = {
                stripePaymentMethodId: paymentMethod.id,
                amount: totalAmount, // total payable (in dollars, including surcharge)
                currency: "AUD",
                giftCertificateApplied: true,
                gc_details: {
                    amount: gcAmount,
                    to: gcTo,
                    from: gcFrom,
                    message: gcMessage,
                    recipient_first_name: recipientFirstName,
                    recipient_last_name: recipientLastName,
                },
                customer: {
                    first_name: customerFirstName,
                    last_name: customerLastName,
                    phone: customerPhone,
                    email: customerEmail,
                },
                surcharge: surcharge,
            };

            // Send the payload via your REST API endpoint.
            const response = await fetch("/wp-json/bookitfast/v1/process-gift-certificate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.success) {
                onPaymentSuccess(result);
                setSuccess("Payment successful! Your gift certificate has been processed.");
                // You can add additional UI updates or redirects here
            } else if (response.status === 422) {
                // Handle validation errors
                setError("Validation failed. Please check your input and try again.");
                console.error("Validation errors:", result.errors);
            } else {
                setError(result.message || "Payment failed.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Payment processing error:", err);
        } finally {
            setLoading(false);
        }
    };

    return React.createElement('div', { className: 'payment-container' },
        React.createElement('h3', null, 'Payment Details'),
        React.createElement('div', { className: 'amount-summary' },
            React.createElement('p', null,
                React.createElement('strong', null, 'Total Payable:'),
                ' $', parseFloat(totalAmount).toFixed(2)
            ),
            React.createElement('p', null,
                React.createElement('strong', null, 'Includes Processing Surcharge:'),
                ' $', parseFloat(surcharge).toFixed(2)
            )
        ),
        error && React.createElement('p', { className: 'alert alert-danger' }, error),
        success && React.createElement('p', { className: 'alert alert-success' }, success),
        React.createElement('form', { onSubmit: handleSubmit },
            React.createElement(CardElement, {
                options: {
                    hidePostalCode: true,
                    style: {
                        base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
                        invalid: { color: "#9e2146" },
                    },
                }
            }),
            React.createElement('button', {
                type: 'submit',
                disabled: !stripe || loading || success,
                className: 'btn btn-primary stripe-payment-button'
            }, loading ? "Processing..." : success ? "Payment Complete" : "Pay Now")
        )
    );
}

// Main front-end logic.
function GiftCertificateFrontend() {
    const container = document.querySelector(".bif-bookitfast-certificate-form");
    if (!container) return;
    const stripePk = container.getAttribute("data-stripe-pk");
    const surchargeRate = parseFloat(container.getAttribute("data-surcharge-rate"));

    // Listen for the "Proceed to Payment" button click.
    const proceedButton = document.getElementById("gc-proceed-button");
    if (!proceedButton) return;

    proceedButton.addEventListener("click", () => {
        const { isValid, errorMessages } = validateForm();

        if (!isValid) {
            // Display error messages
            const errorContainer = document.getElementById('gc-error-container');
            errorContainer.innerHTML = errorMessages.map(msg => `<p>${msg}</p>`).join('');
            errorContainer.style.display = 'block';
            return;
        }

        // Clear any previous error messages
        document.getElementById('gc-error-container').style.display = 'none';

        // Get the entered amount.
        const amountField = container.querySelector("#gc_amount");
        let amount = parseFloat(amountField.value);
        if (isNaN(amount)) amount = 0;

        // Calculate surcharge if applicable:
        // Formula: ((amount + 0.3) / (1 - (surchargeRate/100))) - amount
        const calculatedSurcharge = (((amount + 0.3) / (1 - (surchargeRate / 100))) - amount);
        const totalAmount = parseFloat((amount + calculatedSurcharge).toFixed(2));

        proceedButton.disabled = true;

        // Amount calculation complete

        // Create a container for the Stripe payment form.
        const paymentContainer = document.createElement("div");
        paymentContainer.id = "gift-certificate-payment-form-container";
        container.querySelector("form").appendChild(paymentContainer);

        // Render the React payment form.
        ReactDOM.render(
            React.createElement(Elements, { stripe: loadStripe(stripePk) },
                React.createElement(GiftCertificatePaymentForm, {
                    stripePk: stripePk,
                    totalAmount: totalAmount,
                    surcharge: calculatedSurcharge.toFixed(2),
                    onPaymentSuccess: (result) => {
                        // Payment completed successfully
                        // You can redirect or update the UI here.
                    }
                })
            ),
            paymentContainer
        );
    });
}

document.addEventListener("DOMContentLoaded", () => {
    GiftCertificateFrontend();
});

// Frontend initialization complete
