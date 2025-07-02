<?php

function bookitfast_sanitize_and_validate_gc_data($data)
{
    $errors = [];
    $sanitized = [];

    $required_fields = [
        'amount',
        'to',
        'from',
        'message',
        'recipient_first_name',
        'recipient_last_name',
        'first_name',
        'last_name',
        'phone',
        'email'
    ];

    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
        } else {
            $sanitized[$field] = sanitize_text_field($data[$field]);
        }
    }

    // Validate email
    if (!empty($data['customer_email']) && !is_email($data['customer_email'])) {
        $errors[] = 'Please enter a valid email address.';
    } else {
        $sanitized['customer_email'] = sanitize_email($data['customer_email']);
    }

    // Validate phone (basic validation, adjust regex as needed)
    if (!empty($data['customer_phone']) && !preg_match('/^\+?[0-9]{10,14}$/', $data['customer_phone'])) {
        $errors[] = 'Please enter a valid phone number.';
    }

    return ['sanitized' => $sanitized, 'errors' => $errors];
}

function bookitfast_render_gift_certificate_block($attributes)
{
    // Set a default button color if none is provided.
    $buttonColor = isset($attributes['buttonColor']) ? $attributes['buttonColor'] : '#2563eb';
    $token = bookitfast_get_token();
    $settings = is_wp_error($token) ? [] : bookitfast_fetch_gift_certificate_settings($token);

    // Check if gift certificates are enabled.
    if (! isset($settings['enable_gift_certificates']) || ! $settings['enable_gift_certificates']) {
        return '<div class="bif-alert bif-alert-danger">Sorry, but Gift Certificates Are Not Enabled</div>';
    }

    // Get custom limits and preset amounts.
    $allowCustom = isset($settings['allow_custom_gift_certificate_amounts']) && $settings['allow_custom_gift_certificate_amounts'];
    $min = isset($settings['minimum_gift_certificate']) ? $settings['minimum_gift_certificate'] : '';
    $max = isset($settings['maximum_gift_certificate']) ? $settings['maximum_gift_certificate'] : '';

    $presetAmounts = [];
    if (isset($settings['gift_certificate_amounts']) && $settings['gift_certificate_amounts']) {
        // Explode the amounts into an array.
        $amountsArray = explode(',', $settings['gift_certificate_amounts']);
        foreach ($amountsArray as $amt) {
            $presetAmounts[] = trim($amt);
        }
    }
    $stripePublishableKey = isset($settings['stripe_publishable_key']) ? $settings['stripe_publishable_key'] : '';

    $surchargeRate = 1.75; // percent

    ob_start();
?>
    <style>
        .bif-bookitfast-certificate-form {
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
        }

        .bif-form-header {
            background: linear-gradient(135deg, <?php echo esc_attr($buttonColor); ?> 0%, <?php echo esc_attr($buttonColor); ?>dd 100%);
            color: white;
            padding: 32px;
            text-align: center;
        }

        .bif-form-header h3 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.025em;
        }

        .bif-form-content {
            padding: 32px;
        }

        .bif-alert {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-weight: 500;
        }

        .bif-alert-danger {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }

        .bif-alert-success {
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }

        .bif-section {
            margin-bottom: 40px;
        }

        .bif-section:last-child {
            margin-bottom: 0;
        }

        .bif-section h4 {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }

        .bif-form-group {
            margin-bottom: 20px;
        }

        .bif-form-group label {
            display: block;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
            font-size: 14px;
        }

        .bif-form-control {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            color: #1f2937;
            background: white;
            transition: all 0.2s ease;
        }

        .bif-form-control:focus {
            outline: none;
            border-color: <?php echo esc_attr($buttonColor); ?>;
            box-shadow: 0 0 0 3px <?php echo esc_attr($buttonColor); ?>1a;
        }

        .bif-form-control:hover {
            border-color: #d1d5db;
        }

        select.bif-form-control {
            cursor: pointer;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 12px center;
            background-repeat: no-repeat;
            background-size: 16px;
            padding-right: 40px;
            appearance: none;
        }

        .bif-form-row {
            display: flex;
            flex-direction: column;
        }

        .bif-user-details-form {
            padding: 0;
        }

        .bif-payment-container {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin-top: 32px;
            border: 1px solid #e2e8f0;
            animation: fadeIn 0.3s ease;
        }

        .bif-payment-container h3 {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }

        .bif-amount-summary {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            border: 1px solid #e5e7eb;
        }

        .bif-amount-summary p {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .bif-amount-summary p:last-child {
            margin-bottom: 0;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            font-weight: 600;
            color: #1f2937;
        }

        .bif-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 28px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 48px;
        }

        .bif-btn-primary {
            background: linear-gradient(135deg, <?php echo esc_attr($buttonColor); ?> 0%, <?php echo esc_attr($buttonColor); ?>dd 100%);
            color: white;
            box-shadow: 0 4px 6px -1px <?php echo esc_attr($buttonColor); ?>4d;
        }

        .bif-btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, <?php echo esc_attr($buttonColor); ?>dd 0%, <?php echo esc_attr($buttonColor); ?> 100%);
            box-shadow: 0 8px 12px -1px <?php echo esc_attr($buttonColor); ?>66;
            transform: translateY(-1px);
        }

        .bif-btn-primary:active {
            transform: translateY(0);
        }

        .bif-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }

        .bif-btn-rounded {
            border-radius: 24px;
        }

        .bif-stripe-payment-button {
            width: 100%;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            font-weight: 600;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);
        }

        .bif-stripe-payment-button:hover {
            background: linear-gradient(135deg, #047857 0%, #059669 100%);
            box-shadow: 0 8px 12px -1px rgba(5, 150, 105, 0.4);
            transform: translateY(-1px);
        }

        .bif-stripe-payment-button:active {
            transform: translateY(0);
        }

        .bif-button-container {
            text-align: center;
            margin-top: 32px;
        }

        .StripeElement {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 16px;
            transition: border-color 0.2s ease;
        }

        .StripeElement--focus {
            border-color: <?php echo esc_attr($buttonColor); ?>;
            box-shadow: 0 0 0 3px <?php echo esc_attr($buttonColor); ?>1a;
        }

        .StripeElement--invalid {
            border-color: #dc2626;
        }

        .StripeElement iframe {
            height: 20px;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .bif-form-header {
                padding: 24px;
            }

            .bif-form-header h3 {
                font-size: 24px;
            }

            .bif-form-content {
                padding: 24px;
            }

            .bif-payment-container {
                padding: 20px;
                margin-top: 24px;
            }
        }

        @media (max-width: 480px) {
            .bif-form-header {
                padding: 20px;
            }

            .bif-form-content {
                padding: 20px;
            }

            .bif-section {
                margin-bottom: 32px;
            }
        }
    </style>

    <div class="bif-bookitfast-certificate-form"
        data-allow-custom="<?php echo $allowCustom ? 'true' : 'false'; ?>"
        data-surcharge-rate="<?php echo esc_attr($surchargeRate); ?>"
        data-stripe-pk="<?php echo esc_attr($stripePublishableKey); ?>">

        <div class="bif-form-header">
            <h3>Purchase a Gift Certificate</h3>
        </div>

        <div class="bif-form-content">
            <div id="bif-gc-error-container" class="bif-alert bif-alert-danger" style="display: none;"></div>

            <form id="bif-gift-certificate-purchase-form" method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <!-- Gift Certificate Details -->
                <div class="bif-section">
                    <h4>Gift Certificate Details</h4>
                    <div class="bif-form-group bif-form-row">
                        <label for="bif-gc_amount">Amount:</label>
                        <?php if ($allowCustom) : ?>
                            <input type="number" id="bif-gc_amount" name="gc_amount" step="0.01" class="bif-form-control" required
                                placeholder="Between $<?php echo esc_attr($min); ?> and $<?php echo esc_attr($max); ?>" min="<?php echo esc_attr($min); ?>" max="<?php echo esc_attr($max); ?>">
                        <?php else : ?>
                            <select id="bif-gc_amount" name="gc_amount" class="bif-form-control" required>
                                <?php foreach ($presetAmounts as $amt) : ?>
                                    <option value="<?php echo esc_attr($amt); ?>">$<?php echo number_format((float)$amt, 2); ?></option>
                                <?php endforeach; ?>
                            </select>
                        <?php endif; ?>
                    </div>
                    <div class="bif-form-group bif-form-row">
                        <label for="bif-gc_to">To (Displayed on Certificate):</label>
                        <input type="text" id="bif-gc_to" name="gc_to" class="bif-form-control" placeholder="Recipient's name" required>
                    </div>
                    <div class="bif-form-group bif-form-row">
                        <label for="bif-gc_from">From (Displayed on Certificate):</label>
                        <input type="text" id="bif-gc_from" name="gc_from" class="bif-form-control" placeholder="Your name" required>
                    </div>
                    <div class="bif-form-group bif-form-row">
                        <label for="bif-gc_message">Message:</label>
                        <input type="text" id="bif-gc_message" name="gc_message" class="bif-form-control" placeholder="Personal message for the certificate" required>
                    </div>
                </div>

                <!-- Recipient Details -->
                <div class="bif-section">
                    <h4>Recipient Details</h4>
                    <div class="bif-form-group bif-form-row">
                        <label for="bif-recipient_first_name">Recipient First Name:</label>
                        <input type="text" id="bif-recipient_first_name" name="recipient_first_name" class="bif-form-control" placeholder="First name" required>
                    </div>
                    <div class="bif-form-group bif-form-row">
                        <label for="bif-recipient_last_name">Recipient Last Name:</label>
                        <input type="text" id="bif-recipient_last_name" name="recipient_last_name" class="bif-form-control" placeholder="Last name" required>
                    </div>
                </div>

                <!-- Your Details -->
                <div class="bif-section">
                    <h4>Your Details</h4>
                    <div class="bif-user-details-form">
                        <div class="bif-form-group bif-form-row">
                            <label for="bif-customer_first_name">First Name:</label>
                            <input type="text" id="bif-customer_first_name" name="customer_first_name" class="bif-form-control" placeholder="Your first name" required>
                        </div>
                        <div class="bif-form-group bif-form-row">
                            <label for="bif-customer_last_name">Last Name:</label>
                            <input type="text" id="bif-customer_last_name" name="customer_last_name" class="bif-form-control" placeholder="Your last name" required>
                        </div>
                        <div class="bif-form-group bif-form-row">
                            <label for="bif-customer_phone">Phone:</label>
                            <input type="tel" id="bif-customer_phone" name="customer_phone" class="bif-form-control" placeholder="Your phone number" required>
                        </div>
                        <div class="bif-form-group bif-form-row">
                            <label for="bif-customer_email">Email:</label>
                            <input type="email" id="bif-customer_email" name="customer_email" class="bif-form-control" placeholder="Your email address" required>
                        </div>
                    </div>
                </div>

                <!-- Stripe Payment Container -->
                <div id="bif-stripe-gc-payment">
                    <!-- Stripe Elements container will be injected here if a payment is required -->
                </div>

                <div class="bif-button-container">
                    <button type="button" id="bif-gc-proceed-button" class="bif-btn bif-btn-primary bif-btn-rounded" style="background: linear-gradient(135deg, <?php echo esc_attr($buttonColor); ?> 0%, <?php echo esc_attr($buttonColor); ?>dd 100%);">
                        Make Payment
                    </button>
                </div>
            </form>
        </div>
    </div>
<?php
    return ob_get_clean();
}


add_action('rest_api_init', function () {
    register_rest_route('bookitfast/v1', '/gc-settings', array(
        'methods'             => 'GET',
        'callback'            => 'bookitfast_get_gc_settings',
        'permission_callback' => '__return_true',
    ));
});

function bookitfast_get_gc_settings(WP_REST_Request $request)
{
    // Get the token from your storage
    $token = bookitfast_get_token();
    if (! $token) {
        return new WP_Error('no_token', 'No API token found.', array('status' => 401));
    }

    $settings = bookitfast_fetch_gc_settings($token);
    if (is_wp_error($settings)) {
        return $settings;
    }
    return rest_ensure_response($settings);
}

add_action('rest_api_init', function () {
    register_rest_route('bookitfast/v1', '/process-gift-certificate', array(
        'methods'             => 'POST',
        'callback'            => 'bookitfast_process_gift_certificate',
        'permission_callback' => '__return_true', // For production, add proper permission checks.
    ));
});
