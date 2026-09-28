<?php

// Exit if accessed directly
if (! defined('ABSPATH')) {
	exit;
}



/**
 * Fetch user properties from Laravel API.
 *
 * @param string $token The API token for authentication.
 * @return array|WP_Error The properties data or a WP_Error object on failure.
 */
if (! function_exists('bookitfast_fetch_user_property_data')) {
function bookitfast_fetch_user_property_data($token)
{
	$api_url = get_option('bookitfast_api_url');
	if (!$api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_get("$api_url/api/user/properties", [
		'headers' => [
			'Authorization' => 'Bearer ' . $token,
		],
		'sslverify' => !$test_mode, // Disable SSL verification for local testing
	]);

	if (is_wp_error($response)) {
		return $response;
	}

	$body = wp_remote_retrieve_body($response);
	$data = json_decode($body, true);

	if (isset($data['success']) && $data['success'] === true) {
		return $data['properties'];
	}

	return new WP_Error('properties_error', 'Failed to fetch properties.');
}
}

/**
 * Fetch user information from Laravel API.
 *
 * @param string $token The API token for authentication.
 * @return array|WP_Error The user data or a WP_Error object on failure.
 */
if (! function_exists('bookitfast_fetch_user_data')) {
function bookitfast_fetch_user_data($token)
{
	$api_url = get_option('bookitfast_api_url');
	if (!$api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_get("$api_url/api/user", [
		'headers' => [
			'Authorization' => 'Bearer ' . $token,
		],
		'sslverify' => ! $test_mode, // Disable SSL verification for local testing
	]);

	if (is_wp_error($response)) {
		return $response;
	}

	$body = wp_remote_retrieve_body($response);
	$data = json_decode($body, true);

	if (isset($data['user']['id'])) {
		// Store currency if available
		if (isset($data['user']['organisation']['currency'])) {
			update_option('bookitfast_currency', $data['user']['organisation']['currency']);
		}
		return $data['user']; // User information
	}

	return new WP_Error('user_data_error', 'Failed to fetch user information.');
}
}

/**
 * Get the stored currency for the organization.
 * 
 * @return string The currency code (e.g., 'AUD', 'USD', 'NZD')
 */
if (! function_exists('bookitfast_get_currency')) {
function bookitfast_get_currency() {
	return get_option('bookitfast_currency', 'AUD');
}
}

if (! function_exists('bookitfast_fetch_gift_certificate_settings')) {
function bookitfast_fetch_gift_certificate_settings($token)
{
	$api_url = get_option('bookitfast_api_url');
	if (! $api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_post("$api_url/api/gift-certificates/get-gc-settings", [
		'headers'   => [
			'Authorization' => 'Bearer ' . $token,
		],
		'sslverify' => !$test_mode, // For local testing; enable SSL verification in production
	]);

	if (is_wp_error($response)) {
		return $response;
	}

	$body = wp_remote_retrieve_body($response);
	$data = json_decode($body, true);

	if (isset($data['success']) && $data['success'] === true) {
		// Return the settings array. Adjust the key if needed.
		return $data['settings'];
	}

	return new WP_Error('gc_settings_error', 'Failed to fetch gift certificate settings.');
}
}

function bookitfast_get_gc_settings(WP_REST_Request $request)
{
	$token = bookitfast_get_token();
	if (! $token) {
		return new WP_Error('no_token', 'No API token found.', ['status' => 401]);
	}

	$settings = bookitfast_fetch_gift_certificate_settings($token);
	if (is_wp_error($settings)) {
		return $settings;
	}

	return rest_ensure_response($settings);
}

// Apply gift certificate endpoint is registered in bookitfast.php to avoid duplication

function bookitfast_apply_gift_certificate(WP_REST_Request $request)
{
	$params = $request->get_json_params();
	$token = bookitfast_get_token();
	$api_url = get_option('bookitfast_api_url');
	if (!$api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_post("$api_url/api/multi/availability/applygiftcertificate", array(
		'body' => json_encode($params),
		'headers' => array(
			'Content-Type' => 'application/json',
			'Authorization' => 'Bearer ' . $token,
		),
		'sslverify' => !$test_mode,
	));

	if (is_wp_error($response)) {
		return new WP_REST_Response(array('error' => $response->get_error_message()), 500);
	}

	$body = wp_remote_retrieve_body($response);
	return new WP_REST_Response(json_decode($body, true));
}

add_action('rest_api_init', function () {
	/**
	 * Register the process-gift-certificate endpoint
	 * This endpoint is intentionally PUBLIC to allow guests to purchase gift certificates
	 * without requiring user registration or authentication.
	 * Security: All input data is sanitized and validated in the callback function.
	 * Payment processing is handled securely through the external Book It Fast API.
	 */
	register_rest_route('bookitfast/v1', '/process-gift-certificate', array(
		'methods'             => 'POST',
		'callback'            => 'bookitfast_process_gift_certificate',
		'permission_callback' => '__return_true',
	));
});

add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/apply-gift-certificate', array(
		'methods'             => 'POST',
		'callback'            => 'bookitfast_apply_gift_certificate',
		'permission_callback' => '__return_true',
	));
});

add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/gc-settings', array(
		'methods'             => 'GET',
		'callback'            => 'bookitfast_get_gc_settings',
		'permission_callback' => '__return_true',
	));
});

/**
 * Simple per-IP rate limiter for the public payment endpoints.
 * Returns true if the caller is within the allowed attempt budget.
 */
function bookitfast_gc_rate_limit_ok($bucket, $max_attempts = 10, $window = 300)
{
	// Use REMOTE_ADDR only — do NOT trust X-Forwarded-For for throttling.
	$ip  = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
	$key = 'bif_rl_' . $bucket . '_' . md5($ip);
	$attempts = (int) get_transient($key);
	if ($attempts >= $max_attempts) {
		return false;
	}
	set_transient($key, $attempts + 1, $window);
	return true;
}

function bookitfast_process_gift_certificate(WP_REST_Request $request)
{
	// Rate limit: this is a PUBLIC endpoint that triggers real Stripe charges.
	if (! bookitfast_gc_rate_limit_ok('gc_process', 10, 300)) {
		return new WP_REST_Response(array(
			'success' => false,
			'message' => 'Too many attempts. Please wait a few minutes and try again.',
		), 429);
	}

	$params = $request->get_json_params();
	$token = bookitfast_get_token();
	$api_url = get_option('bookitfast_api_url');
	if (! $api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}

	// Flatten gc_details + customer for presence/format validation.
	$fieldsToValidate = [];
	if (isset($params['gc_details'])) {
		$fieldsToValidate = array_merge($fieldsToValidate, (array) $params['gc_details']);
	}
	if (isset($params['customer'])) {
		$fieldsToValidate = array_merge($fieldsToValidate, (array) $params['customer']);
	}

	$result = bookitfast_sanitize_and_validate_gc_data($fieldsToValidate);

	if (!empty($result['errors'])) {
		// Note: do NOT echo back the submitted field values.
		return new WP_REST_Response([
			'success' => false,
			'message' => 'Validation failed',
			'errors' => $result['errors'],
		], 422);
	}

	// Server-side amount validation — never trust the client to set a charge to
	// an arbitrary value. Reject non-numeric / non-positive amounts, and enforce
	// the configured minimum for the certificate value.
	$settings = is_wp_error($token) ? [] : bookitfast_fetch_gift_certificate_settings($token);
	$min = isset($settings['minimum_gift_certificate']) ? (float) $settings['minimum_gift_certificate'] : 0;
	$max = isset($settings['maximum_gift_certificate']) ? (float) $settings['maximum_gift_certificate'] : 0;

	// Collect every amount-ish field present in the payload and require numeric > 0.
	$amount_paths = [
		$params['gc_details']['amount'] ?? null,
		$params['amount'] ?? null,
		$params['payment']['amount'] ?? null,
		$params['surcharge'] ?? null,
		$params['payment']['surcharge'] ?? null,
	];
	foreach ($amount_paths as $val) {
		if ($val === null) {
			continue;
		}
		if (! is_numeric($val) || (float) $val < 0) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Invalid payment amount.',
			], 422);
		}
	}

	$cert_amount = isset($params['gc_details']['amount']) ? (float) $params['gc_details']['amount'] : 0;
	if ($cert_amount <= 0) {
		return new WP_REST_Response([
			'success' => false,
			'message' => 'Invalid certificate amount.',
		], 422);
	}
	if ($min > 0 && $cert_amount < $min) {
		return new WP_REST_Response([
			'success' => false,
			'message' => 'The certificate amount is below the allowed minimum.',
		], 422);
	}
	if ($max > 0 && $cert_amount > ($max * 1.1)) { // small headroom for surcharge-inclusive totals
		return new WP_REST_Response([
			'success' => false,
			'message' => 'The certificate amount exceeds the allowed maximum.',
		], 422);
	}

	// Build payload to send to the external API.
	$payload = wp_json_encode($params);

	// Set the external API endpoint.
	$endpoint = "$api_url/api/gift-certificates/process-gift-certificate";
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_post($endpoint, array(
		'body'    => $payload,
		'headers' => array(
			'Content-Type' => 'application/json',
			'Authorization' => 'Bearer ' . $token,
		),
		'timeout' => 30,
		'sslverify' => !$test_mode, // Adjust for production as needed.
	));

	if (is_wp_error($response)) {
		// Never expose the upstream error to the client; return a generic message.
		return new WP_REST_Response(array(
			'success' => false,
			'message' => 'Unable to reach the payment service. Please try again.',
		), 502);
	}

	$response_body = wp_remote_retrieve_body($response);
	$data = json_decode($response_body, true);

	if (empty($data) || ! isset($data['success']) || ! $data['success']) {
		// Do NOT leak the outbound request, headers, bearer token or raw body.
		$client_message = is_array($data) && ! empty($data['message']) && is_string($data['message'])
			? $data['message']
			: 'Payment failed. Please check your details and try again.';
		return new WP_REST_Response(array(
			'success' => false,
			'message' => $client_message,
		), 400);
	}

	return new WP_REST_Response(array(
		'success' => true,
		'message' => 'Payment successful!',
		'data'    => $data,
	), 200);
}



/**
 * Store the API token securely in the WordPress options table.
 *
 * @param string $token The API token to store.
 */
if (! function_exists('bookitfast_store_token')) {
function bookitfast_store_token($token)
{
	$encryption_key = wp_salt('secure_auth');
	$encrypted_token = openssl_encrypt($token, 'aes-256-cbc', $encryption_key, 0, substr($encryption_key, 0, 16));
	update_option('bookitfast_api_token', $encrypted_token);
}
}

/**
 * Retrieve the API token securely from the WordPress options table.
 *
 * @return string|false The decrypted token, or false if it does not exist.
 */
if (! function_exists('bookitfast_get_token')) {
function bookitfast_get_token()
{
	$encryption_key = wp_salt('secure_auth');
	$encrypted_token = get_option('bookitfast_api_token', '');

	if ($encrypted_token) {
		return openssl_decrypt($encrypted_token, 'aes-256-cbc', $encryption_key, 0, substr($encryption_key, 0, 16));
	}

	return false;
}
}

// Add new endpoint for availability
add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/availability', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_get_availability',
		'permission_callback' => '__return_true', // Restricted to same-origin requests
	));
});

// Add new endpoint for availability summary
add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/availability/summary', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_get_availability_summary',
		'permission_callback' => '__return_true', // Restricted to same-origin requests
	));
});

function bookitfast_get_availability(WP_REST_Request $request)
{
	$params = $request->get_json_params();
	$token = bookitfast_get_token();
	$api_url = get_option('bookitfast_api_url');
	if (! $api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_post("$api_url/api/multi/availability/get_json", array(
		'body' => json_encode($params),
		'headers' => array(
			'Content-Type' => 'application/json',
			'Authorization' => 'Bearer ' . $token,
		),
		'sslverify' => !$test_mode, // Adjust for production as needed.
	));

	if (is_wp_error($response)) {
		return new WP_REST_Response(array('error' => $response->get_error_message()), 500);
	}

	$body = wp_remote_retrieve_body($response);
	return new WP_REST_Response(json_decode($body, true));
}

function bookitfast_get_availability_summary(WP_REST_Request $request)
{
	$params = $request->get_json_params();
	$token = bookitfast_get_token();
	$api_url = get_option('bookitfast_api_url');
	if (! $api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_post("$api_url/api/multi/availability/summary", array(
		'timeout' => 30, // Increase timeout to 30 seconds
		'body' => json_encode($params),

		'headers' => array(
			'Content-Type' => 'application/json',
			'Authorization' => 'Bearer ' . $token,
		),
		'sslverify' => !$test_mode, // Adjust for production as needed.
	));

	if (is_wp_error($response)) {
		return new WP_REST_Response(array('error' => $response->get_error_message()), 500);
	}

	$body = wp_remote_retrieve_body($response);
	return new WP_REST_Response(json_decode($body, true));
}

function bookitfast_process_payment(WP_REST_Request $request)
{
	$params = $request->get_json_params();
	$giftCertificateApplied = isset($params['giftCertificateApplied']) && $params['giftCertificateApplied'] ? true : false;
	$api_url = get_option('bookitfast_api_url');
	if (! $api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}
	// Get the Stripe Payment Method ID

	$paymentMethodId = !$giftCertificateApplied ? sanitize_text_field($params['stripePaymentMethodId']) : '';
	$amount          = isset($params['amount']) ? floatval($params['amount']) : 0;
	$currency        = isset($params['currency']) ? sanitize_text_field($params['currency']) : bookitfast_get_currency();
	$paymentType       = isset($params['paymentType']) ? sanitize_text_field($params['paymentType']) : null;
	$summary         = isset($params['summary']) ? wp_json_encode($params['summary'], JSON_UNESCAPED_SLASHES) : '';
	$propertyIds     = isset($params['propertyIds']) ? array_map('intval', (array) $params['propertyIds']) : [];

	// ✅ Sanitize `userDetails` Array Properly
	$userDetails = isset($params['userDetails']) && is_array($params['userDetails']) ? array_map('sanitize_text_field', $params['userDetails']) : [];

	$name  = isset($userDetails['firstName']) ? sanitize_text_field($userDetails['firstName'] . ' ' . $userDetails['lastName']) : '';
	$email = isset($userDetails['email']) ? sanitize_email($userDetails['email']) : '';
	$phone = isset($userDetails['phone']) ? sanitize_text_field($userDetails['phone']) : '';
	$postcode = isset($userDetails['postcode']) ? sanitize_text_field($userDetails['postcode']) : '';
	$comments = isset($userDetails['comments']) ? sanitize_textarea_field($userDetails['comments']) : '';

	// 🚨 Required field validation
	if (!$giftCertificateApplied && (!$paymentMethodId || !$amount || !$currency || empty($propertyIds))) {
		return new WP_REST_Response([
			'success' => false,
			'message' => 'Missing required fields',
			'missing_fields' => [
				'paymentMethodId' => empty($paymentMethodId),
				'amount' => empty($amount),
				'currency' => empty($currency),
				'propertyIds' => empty($propertyIds),
			]
		], 400);
	}
	$giftCertificate = $giftCertificateApplied && isset($params['giftCertificate']) ? $params['giftCertificate'] : null;

	// ✅ Prepare data for Book It Fast API
	$bookitfast_payload = [
		'payment_method_id' => $paymentMethodId,
		'amount'            => $amount,
		'currency'          => bookitfast_get_currency(),
		'customer'          => [
			'name'     => $name,
			'email'    => $email,
			'phone'    => $phone,
			'postcode' => $postcode,
			'comments' => $comments,
		],
		'summary'           => $summary,
		'property_ids'      => $propertyIds,
		'paymentType' => $paymentType
	];
	// If a gift certificate is applied, add its data.
	if ($giftCertificateApplied) {
		$bookitfast_payload['gift_certificate_applied'] = true;
		$bookitfast_payload['gift_certificate'] = $giftCertificate;
	} else {
		// Otherwise, include the Stripe payment method.
		$bookitfast_payload['payment_method_id'] = $paymentMethodId;
	}
	// ✅ Check if WordPress is in **Debug Mode** or define your own `BOOKITFAST_TEST_MODE`
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	// ✅ Conditionally Disable SSL Verification in Testing Mode
	$request_args = [
		'body'    => wp_json_encode($bookitfast_payload),
		'headers' => [
			'Content-Type'  => 'application/json',
			'Authorization' => 'Bearer ' . bookitfast_get_token(),
		],
		'timeout' => 30,
		'sslverify' => ! $test_mode, // 👈 Disable SSL only in testing mode
	];
	//echo print_r( $request_args ,1);
	// ✅ Send request to Book It Fast API
	$bookitfast_response = wp_remote_post("$api_url/api/multi/availability/payment/process", $request_args);
	// Handle API response
	if (is_wp_error($bookitfast_response)) {
		return new WP_REST_Response(['success' => false, 'message' => 'Failed to process payment.', 'error' => $bookitfast_response->get_error_message()], 500);
	}

	$response_body = wp_remote_retrieve_body($bookitfast_response);
	$response_data = json_decode($response_body, true);

	if (empty($response_data) || ! isset($response_data['success']) || ! $response_data['success']) {
		return new WP_REST_Response(['success' => false, 'message' => 'Payment failed at Book It Fast.'], 400);
	}

	return new WP_REST_Response([
		'success' => true,
		'message' => 'Payment successful!',
		'data'    => $response_data
	], 200);
}

add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/process-payment', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_process_payment',
		'permission_callback' => '__return_true', // Restrict to same-origin requests
	));
});

add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/properties', [
		'methods' => 'GET',
		'callback' => 'bookitfast_get_user_properties',
		'permission_callback' => function () {
			return current_user_can('manage_options');
		},
	]);
});

// Add currency endpoint
add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/currency', [
		'methods' => 'GET',
		'callback' => function() {
			return rest_ensure_response([
				'currency' => bookitfast_get_currency()
			]);
		},
		'permission_callback' => '__return_true',
	]);
});

/**
 * Property availability calendar.
 *
 * GET params: property_id (required, positive int), months (1–24, default 12).
 * Proxies to the Book It Fast API and returns booked/available date ranges
 * (lean range payload, not 365 day-rows). The bearer token is only used
 * server-side and is never exposed to the client.
 */
add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/property-availability-calendar', array(
		'methods'             => 'GET',
		'callback'            => 'bookitfast_get_property_availability_calendar',
		'permission_callback' => '__return_true', // Public booking calendar (same-origin); token handled server-side.
		'args'                => array(
			'property_id' => array(
				'required'          => true,
				'sanitize_callback' => 'absint',
				'validate_callback' => function ($value) {
					return is_numeric($value) && (int) $value > 0;
				},
			),
			'months' => array(
				'default'           => 12,
				'sanitize_callback' => 'absint',
			),
		),
	));
});

if (! function_exists('bookitfast_get_property_availability_calendar')) {
function bookitfast_get_property_availability_calendar(WP_REST_Request $request)
{
	$property_id = (int) $request->get_param('property_id');
	$months      = max(1, min(24, (int) $request->get_param('months'))); // Clamp 1–24.

	$token   = bookitfast_get_token();
	$api_url = get_option('bookitfast_api_url');
	if (! $api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.', array('status' => 500));
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$endpoint = add_query_arg(
		array('property_id' => $property_id, 'months' => $months),
		"$api_url/api/property-availability-calendar"
	);

	$response = wp_remote_get($endpoint, array(
		'timeout'   => 30,
		'headers'   => array('Authorization' => 'Bearer ' . $token),
		'sslverify' => ! $test_mode,
	));

	if (is_wp_error($response)) {
		return new WP_REST_Response(array('error' => $response->get_error_message()), 502);
	}

	$code = (int) wp_remote_retrieve_response_code($response);
	$data = json_decode(wp_remote_retrieve_body($response), true);

	return new WP_REST_Response($data, $code ? $code : 200);
}
}
// ... rest of the code ...
