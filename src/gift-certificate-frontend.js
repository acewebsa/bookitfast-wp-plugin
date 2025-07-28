import React, { useState } from "react";
import ReactDOM from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import '../assets/frontend.css';
// Gift certificate frontend functionality only

// Form validation function
function validateForm() {
    const fields = [
        { id: 'bif-gc_amount', name: 'Amount' },
        { id: 'bif-gc_to', name: 'To' },
        { id: 'bif-gc_from', name: 'From' },
        { id: 'bif-gc_message', name: 'Message' },
        { id: 'bif-recipient_first_name', name: 'Recipient First Name' },
        { id: 'bif-recipient_last_name', name: 'Recipient Last Name' },
        { id: 'bif-customer_first_name', name: 'Your First Name' },
        { id: 'bif-customer_last_name', name: 'Your Last Name' },
        { id: 'bif-customer_phone', name: 'Your Phone' },
        { id: 'bif-customer_email', name: 'Your Email' },
        { id: 'bif-consent-data-sharing', name: 'Data Sharing Consent', type: 'checkbox' },
    ];

    let isValid = true;
    let errorMessages = [];

    fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element) {
            console.error(`Element with ID ${field.id} not found`);
            return;
        }

        if (field.type === 'checkbox') {
            if (!element.checked) {
                isValid = false;
                errorMessages.push(`${field.name} is required.`);
                element.classList.add('is-invalid');
            } else {
                element.classList.remove('is-invalid');
            }
        } else {
            if (!element.value.trim()) {
                isValid = false;
                errorMessages.push(`${field.name} is required.`);
                element.classList.add('is-invalid');
            } else {
                element.classList.remove('is-invalid');
            }
        }
    });

    // Additional validation for email and phone
    const emailElement = document.getElementById('bif-customer_email');
    if (emailElement) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailElement.value.trim())) {
            isValid = false;
            errorMessages.push('Please enter a valid email address.');
            emailElement.classList.add('is-invalid');
        }
    }

    const phoneElement = document.getElementById('bif-customer_phone');
    if (phoneElement) {
        const phoneRegex = /^\+?[0-9]{10,14}$/;
        if (!phoneRegex.test(phoneElement.value.trim())) {
            isValid = false;
            errorMessages.push('Please enter a valid phone number.');
            phoneElement.classList.add('is-invalid');
        }
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
            const gcAmount = document.getElementById("bif-gc_amount").value;
            const gcTo = document.getElementById("bif-gc_to").value;
            const gcFrom = document.getElementById("bif-gc_from").value;
            const gcMessage = document.getElementById("bif-gc_message").value;
            const recipientFirstName = document.getElementById("bif-recipient_first_name").value;
            const recipientLastName = document.getElementById("bif-recipient_last_name").value;
            const customerFirstName = document.getElementById("bif-customer_first_name").value;
            const customerLastName = document.getElementById("bif-customer_last_name").value;
            const customerPhone = document.getElementById("bif-customer_phone").value;
            const customerEmail = document.getElementById("bif-customer_email").value;

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

    return React.createElement('div', { className: 'bif-payment-container' },
        React.createElement('h3', null, 'Payment Details'),
        React.createElement('div', { className: 'bif-amount-summary' },
            React.createElement('p', null,
                React.createElement('span', null, 'Subtotal:'),
                React.createElement('strong', null, '$', parseFloat(totalAmount - surcharge).toFixed(2))
            ),
            React.createElement('p', null,
                React.createElement('span', null, 'Processing Surcharge:'),
                React.createElement('strong', null, '$', parseFloat(surcharge).toFixed(2))
            ),
            React.createElement('p', null,
                React.createElement('span', null, 'Total Payable:'),
                React.createElement('strong', null, '$', parseFloat(totalAmount).toFixed(2))
            )
        ),
        error && React.createElement('div', { className: 'bif-alert bif-alert-danger' }, error),
        success && React.createElement('div', { className: 'bif-alert bif-alert-success' }, success),
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
                className: 'bif-stripe-payment-button'
            }, loading ? "Processing..." : success ? "Payment Complete" : `Pay Now - $${parseFloat(totalAmount).toFixed(2)}`)
        )
    );
}

// Main front-end logic.
function GiftCertificateFrontend() {
   // console.log('GiftCertificateFrontend: Starting initialization');

    const container = document.querySelector(".bif-bookitfast-certificate-form");
    if (!container) {
      //  console.error('GiftCertificateFrontend: Container .bif-bookitfast-certificate-form not found');
        return;
    }

    //console.log('GiftCertificateFrontend: Container found', container);

    const stripePk = container.getAttribute("data-stripe-pk");
    const surchargeRate = parseFloat(container.getAttribute("data-surcharge-rate"));

    //console.log('GiftCertificateFrontend: Stripe PK:', stripePk);
    //console.log('GiftCertificateFrontend: Surcharge rate:', surchargeRate);

    // Listen for the "Proceed to Payment" button click.
    const proceedButton = document.getElementById("bif-gc-proceed-button");
    if (!proceedButton) {
        console.error('GiftCertificateFrontend: Button #bif-gc-proceed-button not found');
        return;
    }

    //console.log('GiftCertificateFrontend: Button found, adding click listener', proceedButton);

    proceedButton.addEventListener("click", () => {
        //console.log('GiftCertificateFrontend: Make Payment button clicked');

        const { isValid, errorMessages } = validateForm();
        //console.log('GiftCertificateFrontend: Form validation result:', { isValid, errorMessages });

        if (!isValid) {
            // Display error messages
            const errorContainer = document.getElementById('bif-gc-error-container');
            if (errorContainer) {
                errorContainer.innerHTML = errorMessages.map(msg => `<p>${msg}</p>`).join('');
                errorContainer.style.display = 'block';
            } else {
                console.error('GiftCertificateFrontend: Error container #bif-gc-error-container not found');
            }
            return;
        }

        // Clear any previous error messages
        const errorContainer = document.getElementById('bif-gc-error-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }

        // Get the entered amount.
        const amountField = container.querySelector("#bif-gc_amount");
        let amount = parseFloat(amountField.value);
        if (isNaN(amount)) amount = 0;

        //console.log('GiftCertificateFrontend: Amount:', amount);

        // Calculate surcharge if applicable:
        // Formula: ((amount + 0.3) / (1 - (surchargeRate/100))) - amount
        const calculatedSurcharge = (((amount + 0.3) / (1 - (surchargeRate / 100))) - amount);
        const totalAmount = parseFloat((amount + calculatedSurcharge).toFixed(2));

        //console.log('GiftCertificateFrontend: Calculated surcharge:', calculatedSurcharge);
        //console.log('GiftCertificateFrontend: Total amount:', totalAmount);

        proceedButton.disabled = true;
        //console.log('GiftCertificateFrontend: Button disabled, proceeding with payment form');

        // Amount calculation complete

        // Create a container for the Stripe payment form.
        const paymentContainer = document.createElement("div");
        paymentContainer.id = "gift-certificate-payment-form-container";
        container.querySelector("form").appendChild(paymentContainer);

        //console.log('GiftCertificateFrontend: Payment container created, rendering React form');

        // Render the React payment form.
        ReactDOM.render(
            React.createElement(Elements, { stripe: loadStripe(stripePk) },
                React.createElement(GiftCertificatePaymentForm, {
                    stripePk: stripePk,
                    totalAmount: totalAmount,
                    surcharge: calculatedSurcharge.toFixed(2),
                    onPaymentSuccess: (result) => {
                        //console.log('GiftCertificateFrontend: Payment completed successfully', result);
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
    //console.log('Gift Certificate Frontend: DOMContentLoaded event fired');
    //console.log('Gift Certificate Frontend: Document ready state:', document.readyState);

    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
       // console.log('Gift Certificate Frontend: Initializing after timeout');
        GiftCertificateFrontend();
    }, 100);
});

// Also try immediate initialization if DOM is already loaded
if (document.readyState === 'loading') {
   // console.log('Gift Certificate Frontend: Document still loading, waiting for DOMContentLoaded');
} else {
   // console.log('Gift Certificate Frontend: Document already loaded, initializing immediately');
    GiftCertificateFrontend();
}

// Frontend initialization complete
