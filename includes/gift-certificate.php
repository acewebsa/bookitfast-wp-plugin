<?php

// Exit if accessed directly
if (! defined('ABSPATH')) exit;

if (! function_exists('bookitfast_sanitize_and_validate_gc_data')) {
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

    // Validate email — the payload key is "email" (not "customer_email").
    if (!empty($data['email'])) {
        if (!is_email($data['email'])) {
            $errors[] = 'Please enter a valid email address.';
        } else {
            $sanitized['email'] = sanitize_email($data['email']);
        }
    }

    // Validate phone — the payload key is "phone" (not "customer_phone").
    if (!empty($data['phone']) && !preg_match('/^\+?[0-9]{10,14}$/', preg_replace('/[\s()-]/', '', $data['phone']))) {
        $errors[] = 'Please enter a valid phone number.';
    }

    return ['sanitized' => $sanitized, 'errors' => $errors];
}
}

/**
 * Render the gift-certificate amount selector.
 *
 * Shared between the Gutenberg block and the Divi module so both emit identical
 * markup. The single source of truth for the chosen amount is the hidden/visible
 * input/select with id="bif-gc_amount" that the frontend JS reads.
 *
 * @param string $mode          'buttons' (tiles) or 'dropdown'.
 * @param array  $presetAmounts Numeric preset amounts.
 * @param bool   $allowCustom   Whether a custom amount is allowed.
 * @param string $min           Minimum custom amount.
 * @param string $max           Maximum custom amount.
 * @return string HTML.
 */
function bookitfast_gc_amount_field_html($mode, $presetAmounts, $allowCustom, $min = '', $max = '')
{
    $mode = ($mode === 'dropdown') ? 'dropdown' : 'buttons';
    ob_start();

    if ($mode === 'buttons') {
        // Tiles write their value into the hidden #bif-gc_amount via JS.
        ?>
        <div class="bif-gc-amount-tiles" role="radiogroup" aria-label="Certificate amount">
            <?php foreach ($presetAmounts as $i => $amt) : ?>
                <label class="bif-gc-amount-tile">
                    <input type="radio" name="gc_amount_choice" value="<?php echo esc_attr($amt); ?>"<?php echo (0 === $i && ! $allowCustom) ? ' checked' : ''; ?>>
                    <span>$<?php echo esc_html(number_format((float) $amt, 0)); ?></span>
                </label>
            <?php endforeach; ?>
            <?php if ($allowCustom) : ?>
                <label class="bif-gc-amount-tile bif-gc-amount-custom-tile">
                    <input type="radio" name="gc_amount_choice" value="custom">
                    <span>Custom</span>
                </label>
            <?php endif; ?>
        </div>
        <?php if ($allowCustom) : ?>
            <div class="bif-gc-custom-amount" style="display:none;">
                <input type="number" id="bif-gc_custom_amount" step="0.01" class="bif-form-control"
                    placeholder="<?php echo esc_attr(($min !== '' || $max !== '') ? "Between \${$min} and \${$max}" : 'Enter amount'); ?>"
                    <?php echo $min !== '' ? 'min="' . esc_attr($min) . '"' : ''; ?>
                    <?php echo $max !== '' ? 'max="' . esc_attr($max) . '"' : ''; ?>>
            </div>
        <?php endif; ?>
        <input type="hidden" id="bif-gc_amount" name="gc_amount" value="">
        <?php
    } else {
        // Dropdown mode.
        if (! empty($presetAmounts)) {
            ?>
            <select id="bif-gc_amount" name="gc_amount" class="bif-form-control" required>
                <?php foreach ($presetAmounts as $amt) : ?>
                    <option value="<?php echo esc_attr($amt); ?>">$<?php echo number_format((float) $amt, 2); ?></option>
                <?php endforeach; ?>
                <?php if ($allowCustom) : ?>
                    <option value="custom">Custom amount…</option>
                <?php endif; ?>
            </select>
            <?php if ($allowCustom) : ?>
                <div class="bif-gc-custom-amount" style="display:none;">
                    <input type="number" id="bif-gc_custom_amount" step="0.01" class="bif-form-control"
                        placeholder="<?php echo esc_attr(($min !== '' || $max !== '') ? "Between \${$min} and \${$max}" : 'Enter amount'); ?>"
                        <?php echo $min !== '' ? 'min="' . esc_attr($min) . '"' : ''; ?>
                        <?php echo $max !== '' ? 'max="' . esc_attr($max) . '"' : ''; ?>>
                </div>
            <?php endif; ?>
            <?php
        } else {
            // No presets — plain number input is the amount field.
            ?>
            <input type="number" id="bif-gc_amount" name="gc_amount" step="0.01" class="bif-form-control" required
                placeholder="<?php echo esc_attr(($min !== '' || $max !== '') ? "Between \${$min} and \${$max}" : 'Enter amount'); ?>"
                <?php echo $min !== '' ? 'min="' . esc_attr($min) . '"' : ''; ?>
                <?php echo $max !== '' ? 'max="' . esc_attr($max) . '"' : ''; ?>>
            <?php
        }
    }

    return ob_get_clean();
}

/**
 * Build the inline CSS custom properties for a gift-certificate instance,
 * including button colors and optional per-part font overrides.
 *
 * @param string $selector       CSS selector for the form wrapper.
 * @param string $buttonColor    Button background color.
 * @param string $buttonTextColor Button text color.
 * @param array  $fonts          Optional map: headingFont, labelFont, bodyFont.
 * @return string CSS.
 */
function bookitfast_gc_inline_vars_css($selector, $buttonColor, $buttonTextColor, $fonts = [], $backgroundColor = '')
{
    // Sanitize before interpolating into a <style> block (prevents CSS/HTML
    // injection / breakout such as "red}</style><script>...").
    $buttonColor     = $buttonColor ? (string) sanitize_hex_color($buttonColor) : '';
    $buttonTextColor = $buttonTextColor ? (string) sanitize_hex_color($buttonTextColor) : '';
    $backgroundColor = $backgroundColor ? (string) sanitize_hex_color($backgroundColor) : '';
    $safe_font = static function ($f) {
        $f = trim((string) $f);
        // Reject anything that could break out of the CSS declaration.
        if ($f === '' || preg_match('/[<>{};:\\\\]/', $f)) {
            return '';
        }
        // Allow only characters valid in a font-family list.
        return preg_replace('/[^A-Za-z0-9 ,_"\'\-]/', '', $f);
    };
    foreach (['bodyFont', 'headingFont', 'labelFont'] as $fk) {
        if (isset($fonts[$fk])) {
            $fonts[$fk] = $safe_font($fonts[$fk]);
        }
    }

    // Return only the declarations (no selector/braces); they are applied via the
    // wrapper element's style="" attribute, escaped with esc_attr() at output.
    $css = '';
    // Only emit override vars when the user actually set a value; otherwise the
    // layout's own default wins. !important so the override beats each layout's
    // own high-specificity var default (and any duplicate stylesheet copies).
    if (! empty($buttonColor)) {
        $css .= "--bif-button-color: {$buttonColor} !important;\n" .
            "--bif-button-color-alpha: {$buttonColor}dd !important;\n" .
            "--bif-button-color-focus: {$buttonColor}1a !important;\n" .
            "--bif-button-color-shadow: {$buttonColor}4d !important;\n" .
            "--bif-button-color-shadow-hover: {$buttonColor}66 !important;\n";
    }
    if (! empty($buttonTextColor)) {
        $css .= "--bif-button-text-color: {$buttonTextColor} !important;\n";
    }
    if (! empty($backgroundColor)) {
        // Direct background override so the form blends with any site/section.
        $css .= "background: {$backgroundColor} !important;\n";
    }
    if (! empty($fonts['bodyFont'])) {
        $css .= '--bif-gc-font: ' . $fonts['bodyFont'] . " !important;\n";
    }
    if (! empty($fonts['headingFont'])) {
        $css .= '--bif-gc-heading-font: ' . $fonts['headingFont'] . " !important;\n";
    }
    if (! empty($fonts['labelFont'])) {
        $css .= '--bif-gc-label-font: ' . $fonts['labelFont'] . " !important;\n";
    }
    return $css;
}

function bookitfast_render_gift_certificate_block($attributes)
{
    // Button colors: empty by default so each layout's own accent shows.
    // A non-empty value (user picked a colour) overrides the layout via CSS vars.
    $buttonColor = isset($attributes['buttonColor']) ? trim($attributes['buttonColor']) : '';
    $buttonTextColor = isset($attributes['buttonTextColor']) ? trim($attributes['buttonTextColor']) : '';
    $backgroundColor = isset($attributes['backgroundColor']) ? trim($attributes['backgroundColor']) : '';

    // Layout + amount selector configuration.
    $allowedLayouts = ['classic', 'minimal', 'bold', 'editorial', 'playful', 'luxury'];
    $layoutStyle = isset($attributes['layoutStyle']) && in_array($attributes['layoutStyle'], $allowedLayouts, true)
        ? $attributes['layoutStyle'] : 'classic';
    $amountSelector = (isset($attributes['amountSelector']) && $attributes['amountSelector'] === 'dropdown')
        ? 'dropdown' : 'buttons';

    // Optional per-part font overrides (inspector controls).
    $fonts = [
        'bodyFont'    => isset($attributes['bodyFont']) ? $attributes['bodyFont'] : '',
        'headingFont' => isset($attributes['headingFont']) ? $attributes['headingFont'] : '',
        'labelFont'   => isset($attributes['labelFont']) ? $attributes['labelFont'] : '',
    ];

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

    // Build the override declarations (colours / background / fonts). Applied via the
    // wrapper's style="" attribute below (esc_attr'd) instead of a raw inline <style>
    // block, so all output is properly escaped for Plugin Check / wp.org review.
    $override_decls = bookitfast_gc_inline_vars_css('', $buttonColor, $buttonTextColor, $fonts, $backgroundColor);

    ob_start();
?>
    <div class="bif-bookitfast-certificate-form bif-gc-layout-<?php echo esc_attr($layoutStyle); ?>"<?php if ($override_decls !== '') { echo ' style="' . esc_attr($override_decls) . '"'; } ?>
        data-allow-custom="<?php echo $allowCustom ? 'true' : 'false'; ?>"
        data-amount-selector="<?php echo esc_attr($amountSelector); ?>"
        data-layout="<?php echo esc_attr($layoutStyle); ?>"
        data-surcharge-rate="<?php echo esc_attr($surchargeRate); ?>"
        data-stripe-pk="<?php echo esc_attr($stripePublishableKey); ?>"
        data-currency="<?php echo esc_attr($settings['currency'] ?? bookitfast_get_currency()); ?>">

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
                        <?php
                        // The helper escapes every dynamic value internally; wp_kses
                        // additionally constrains the markup to this safe element set.
                        echo wp_kses(
                            bookitfast_gc_amount_field_html($amountSelector, $presetAmounts, $allowCustom, $min, $max),
                            array(
                                'div'    => array('class' => true, 'role' => true, 'aria-label' => true, 'style' => true),
                                'label'  => array('class' => true),
                                'span'   => array('class' => true),
                                'input'  => array('type' => true, 'id' => true, 'name' => true, 'value' => true, 'class' => true, 'placeholder' => true, 'min' => true, 'max' => true, 'step' => true, 'checked' => true, 'required' => true),
                                'select' => array('id' => true, 'name' => true, 'class' => true, 'required' => true),
                                'option' => array('value' => true, 'selected' => true),
                            )
                        );
                        ?>
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
                    <button type="button" id="bif-gc-proceed-button" class="bif-btn bif-btn-primary bif-btn-rounded">
                        Make Payment
                    </button>
                </div>
            </form>
        </div>
    </div>
<?php
    return ob_get_clean();
}



// Process gift certificate endpoint is registered in includes/api.php to avoid duplication
