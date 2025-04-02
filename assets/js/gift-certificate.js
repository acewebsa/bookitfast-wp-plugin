jQuery(document).ready(function($) {
    const gcForm = $('#gift-certificate-purchase-form');
    if (!gcForm.length) return;

    // Initialize Stripe
    const stripe = Stripe(bookitFastGC.stripeKey);
    let elements;
    let paymentElement;

    // Handle form submission
    gcForm.on('submit', function(e) {
        e.preventDefault();
    });

    // Handle proceed button click
    $('#gc-proceed-button').on('click', async function(e) {
        e.preventDefault();
        const btn = $(this);
        const originalText = btn.text();

        // Validate form first
        if (!gcForm[0].checkValidity()) {
            gcForm[0].reportValidity();
            return;
        }

        btn.prop('disabled', true).text('Processing...');
        $('#gc-error-container').hide();

        try {
            // Collect form data
            const formData = new FormData(gcForm[0]);
            formData.append('action', 'bookitfast_create_gc_payment_intent');
            formData.append('security', bookitFastGC.nonce);

            const response = await $.ajax({
                url: bookitFastGC.ajaxurl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                error: function(xhr, status, error) {
                    console.error('AJAX Error:', status, error);
                    throw new Error('Network error occurred. Please try again.');
                }
            });

            if (!response.success) {
                throw new Error(response.data?.message || 'Failed to create payment intent');
            }

            // Initialize Stripe Elements
            const options = {
                clientSecret: response.data.clientSecret,
                appearance: {
                    theme: 'stripe'
                }
            };

            elements = stripe.elements(options);
            paymentElement = elements.create('payment');
            
            // Show payment form
            $('#payment-form-container').show();
            paymentElement.mount('#stripe-gc-payment');
            
            // Update button text and handler
            btn.text('Complete Payment')
               .off('click')
               .on('click', handlePayment);

        } catch (error) {
            console.error('Error:', error);
            $('#gc-error-container')
                .html(error.message)
                .show();
            btn.prop('disabled', false).text(originalText);
        }
    });

    async function handlePayment(e) {
        e.preventDefault();
        const btn = $(this);
        btn.prop('disabled', true).text('Processing Payment...');

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/payment-confirmation/',
                }
            });

            if (error) {
                throw error;
            }
        } catch (error) {
            $('#gc-error-container')
                .html(error.message)
                .show();
            btn.prop('disabled', false).text('Complete Payment');
        }
    }
}); 