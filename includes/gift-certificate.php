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
    $buttonColor = isset($attributes['buttonColor']) ? $attributes['buttonColor'] : '#00a80f';
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
    <div class="bif-bookitfast-certificate-form"
        data-allow-custom="<?php echo $allowCustom ? 'true' : 'false'; ?>"
        data-surcharge-rate="<?php echo esc_attr($surchargeRate); ?>"
        data-stripe-pk="<?php echo esc_attr($stripePublishableKey); ?>">
        <h3>Purchase a Gift Certificate</h3>
        <div id="bif-gc-error-container" class="bif-alert bif-alert-danger" style="display: none;"></div>
        <form id="bif-gift-certificate-purchase-form" method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <!-- Gift Certificate Details -->
            <h4>Gift Certificate Details</h4>
            <div class="bif-form-group bif-form-row">
                <label for="gc_amount">Amount:</label>
                <?php if ($allowCustom) : ?>
                    <input type="number" id="bif-gc_amount" name="gc_amount" step="0.01" class="bif-form-control" required
                        placeholder="Between <?php echo esc_attr($min); ?> and <?php echo esc_attr($max); ?>">
                <?php else : ?>
                    <select id="bif-gc_amount" name="gc_amount" class="bif-form-control" required>
                        <?php foreach ($presetAmounts as $amt) : ?>
                            <option value="<?php echo esc_attr($amt); ?>">$<?php echo number_format((float)$amt, 2); ?></option>
                        <?php endforeach; ?>
                    </select>
                <?php endif; ?>
            </div>
            <div class="bif-form-group bif-form-row">
                <label for="gc_to">To (Displayed on Certificate):</label>
                <input type="text" id="bif-gc_to" name="gc_to" class="bif-form-control" required>
            </div>
            <div class="bif-form-group bif-form-row">
                <label for="gc_from">From (Displayed on Certificate):</label>
                <input type="text" id="bif-gc_from" name="gc_from" class="bif-form-control" required>
            </div>
            <div class="bif-form-group bif-form-row">
                <label for="gc_message">Message:</label>
                <input type="text" id="bif-gc_message" name="gc_message" class="bif-form-control" required>
            </div>

            <!-- Recipient Details -->
            <h4>Recipient Details</h4>
            <div class="bif-form-group bif-form-row">
                <label for="recipient_first_name">Recipient First Name:</label>
                <input type="text" id="bif-recipient_first_name" name="recipient_first_name" class="bif-form-control" required>
            </div>
            <div class="bif-form-group bif-form-row">
                <label for="recipient_last_name">Recipient Last Name:</label>
                <input type="text" id="bif-recipient_last_name" name="recipient_last_name" class="bif-form-control" required>
            </div>

            <!-- Your Details -->
            <h4>Your Details</h4>
            <div class="bif-user-details-form">
                <div class="bif-form-group bif-form-row">
                    <label for="customer_first_name">First Name:</label>
                    <input type="text" id="bif-customer_first_name" name="customer_first_name" class="bif-form-control" required>
                </div>
                <div class="bif-form-group bif-form-row">
                    <label for="customer_last_name">Last Name:</label>
                    <input type="text" id="bif-customer_last_name" name="customer_last_name" class="bif-form-control" required>
                </div>
                <div class="bif-form-group bif-form-row">
                    <label for="customer_phone">Phone:</label>
                    <input type="text" id="bif-customer_phone" name="customer_phone" class="bif-form-control" required>
                </div>
                <div class="bif-form-group bif-form-row">
                    <label for="customer_email">Email:</label>
                    <input type="email" id="bif-customer_email" name="customer_email" class="bif-form-control" required>
                </div>
            </div>

            <!-- Stripe Payment Container (if needed) -->
            <div id="bif-stripe-gc-payment">
                <!-- Stripe Elements container will be injected here if a payment is required -->
            </div>

            <button type="button" id="bif-gc-proceed-button" class="bif-btn bif-btn-rounded" style="background-color: <?php echo esc_attr($buttonColor); ?>;">
                Make Payment
            </button>
        </form>
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
