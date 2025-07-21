<?php

// Exit if accessed directly
if (! defined('ABSPATH')) exit;

/**
 * Fetch user properties from Laravel API.
 *
 * @param string $token The API token for authentication.
 * @return array|WP_Error The properties data or a WP_Error object on failure.
 */
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

/**
 * Fetch user information from Laravel API.
 *
 * @param string $token The API token for authentication.
 * @return array|WP_Error The user data or a WP_Error object on failure.
 */
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
		return $data['user']; // User information
	}

	return new WP_Error('user_data_error', 'Failed to fetch user information.');
}

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
		'permission_callback' => '__return_true', // Intentionally public for guest bookings
	));
});

function bookitfast_process_gift_certificate(WP_REST_Request $request)
{
	$params = $request->get_json_params();
	$token = bookitfast_get_token();
	$api_url = get_option('bookitfast_api_url');
	if (! $api_url) {
		return new WP_Error('api_url_missing', 'Laravel API URL is not set.');
	}

	// Skip validation for fields that have already been validated
	$fieldsToValidate = [];
	if (isset($params['gc_details'])) {
		$fieldsToValidate = array_merge($fieldsToValidate, $params['gc_details']);
	}
	if (isset($params['customer'])) {
		$fieldsToValidate = array_merge($fieldsToValidate, $params['customer']);
	}

	$result = bookitfast_sanitize_and_validate_gc_data($fieldsToValidate);

	if (!empty($result['errors'])) {
		return new WP_REST_Response([
			'success' => false,
			'message' => 'Validation failed',
			'errors' => $result['errors'],
			'fields' => $fieldsToValidate,
		], 422);
	}

	// Rest of the processing logic...
	// Use $params for further processing, as it contains all the necessary data

	// Build payload to send to the external API.
	$payload = wp_json_encode($params);

	// Set the external API endpoint.
	$api_url = "$api_url/api/gift-certificates/process-gift-certificate";
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_post($api_url, array(
		'body'    => $payload,
		'headers' => array(
			'Content-Type' => 'application/json',
			'Authorization' => 'Bearer ' . $token,
		),
		'timeout' => 30,
		'sslverify' => !$test_mode, // Adjust for production as needed.
	));

	if (is_wp_error($response)) {
		return new WP_REST_Response(array(
			'success' => false,
			'message' => 'Error connecting to external API: ' . $response->get_error_message(),
			'request' => $request,
		), 500);
	}

	$response_body = wp_remote_retrieve_body($response);
	$data = json_decode($response_body, true);
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	if (empty($data) || ! isset($data['success']) || ! $data['success']) {
		return new WP_REST_Response(array(
			'success' => false,
			'url' => $api_url,
			'response_body' => $response_body,
			'message' => 'Payment failed at external API.',
			'data'    => $data,
			'request' => array(
				'body'    => $payload,
				'headers' => array(
					'Content-Type' => 'application/json',
					'Authorization' => 'Bearer ' . $token,
				),
				'timeout' => 30,
				'sslverify' => !$test_mode, // Adjust for production as needed.
			),
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
function bookitfast_store_token($token)
{
	$encryption_key = wp_salt('secure_auth');
	$encrypted_token = openssl_encrypt($token, 'aes-256-cbc', $encryption_key, 0, substr($encryption_key, 0, 16));
	update_option('bookitfast_api_token', $encrypted_token);
}

/**
 * Retrieve the API token securely from the WordPress options table.
 *
 * @return string|false The decrypted token, or false if it does not exist.
 */
function bookitfast_get_token()
{
	$encryption_key = wp_salt('secure_auth');
	$encrypted_token = get_option('bookitfast_api_token', '');

	if ($encrypted_token) {
		return openssl_decrypt($encrypted_token, 'aes-256-cbc', $encryption_key, 0, substr($encryption_key, 0, 16));
	}

	return false;
}

// Add new endpoint for availability - PUBLIC endpoint for frontend booking forms
add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/availability', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_get_availability',
		'permission_callback' => '__return_true', // Intentionally public for booking forms
	));
});

// Add new endpoint for availability summary - PUBLIC endpoint for frontend booking forms
add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/availability/summary', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_get_availability_summary',
		'permission_callback' => '__return_true', // Intentionally public for booking forms
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
	$currency        = isset($params['currency']) ? sanitize_text_field($params['currency']) : 'AUD';
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
		'currency'          => "AUD",
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
		'permission_callback' => '__return_true', // Intentionally public for guest bookings
	));
});

add_action('rest_api_init', function () {
	register_rest_route('bookitfast/v1', '/properties', [
		'methods' => 'GET',
		'callback' => 'bookitfast_get_user_properties',
		'permission_callback' => function () {
			return current_user_can('read');
		},
	]);
});
// ... rest of the code ...
