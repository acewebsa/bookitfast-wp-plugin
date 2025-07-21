<?php

// Exit if accessed directly
if (! defined('ABSPATH')) exit;

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

    // Add inline CSS custom properties for dynamic theming
    wp_add_inline_style('bookitfast-gc-frontend', "
        .bif-bookitfast-certificate-form {
            --bif-button-color: {$buttonColor};
            --bif-button-color-alpha: {$buttonColor}dd;
            --bif-button-color-focus: {$buttonColor}1a;
            --bif-button-color-shadow: {$buttonColor}4d;
            --bif-button-color-shadow-hover: {$buttonColor}66;
        }
    ");

    ob_start();
?>
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

                <!-- Privacy and Terms Consent -->
                <div class="bif-section">
                    <div class="bif-form-group">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="bif-consent-data-sharing" name="consent_data_sharing" required>
                            <span>I consent to my personal information being transmitted to and processed by Book It Fast
                                (<a href="https://bookitfast.app/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
                                for gift certificate processing and payment purposes.</span>
                        </label>
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
    /**
     * Register the gift certificate settings endpoint
     * This endpoint is intentionally PUBLIC to allow the frontend gift certificate
     * form to fetch necessary configuration settings (pricing, limits, etc.) without
     * requiring user authentication.
     * Security: Only non-sensitive configuration data is returned. Private keys and
     * sensitive data are filtered out in the callback function.
     */
    register_rest_route('bookitfast/v1', '/gc-settings', array(
        'methods'             => 'GET',
        'callback'            => 'bookitfast_get_gc_settings',
        'permission_callback' => '__return_true', // Intentionally public for frontend gift certificate display
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

// Process gift certificate endpoint is registered in includes/api.php to avoid duplication
