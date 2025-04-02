<?php
/**
 * Plugin Name:     Book It Fast
 * Plugin URI:      https://plugins.wp-clid.org/demo-plugin
 * Description:     Book It Fast Plugin For Booking Calendar
 * Author:          bookitfast
 * Author URI:      https://bookitfast.app
 * Text Domain:     bookitfast
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package         Bookitfast
 */

define('BOOKITFAST_PATH', plugin_dir_path(__FILE__));
define('BOOKITFAST_URL', plugin_dir_url(__FILE__));

// Include core plugin files
require_once BOOKITFAST_PATH . 'includes/admin-menu.php';
require_once BOOKITFAST_PATH . 'includes/api.php';
require_once BOOKITFAST_PATH . 'includes/blocks.php';

// Activation hook
register_activation_hook(__FILE__, 'bookitfast_activate');

function bookitfast_activate() {
	// Set default API URL if not already set
	if (!get_option('bookitfast_api_url')) {
		update_option('bookitfast_api_url', 'https://bookitfastfilament.test');
	}
}

// Register REST API routes
add_action('rest_api_init', function () {
	// Register the properties endpoint
	register_rest_route('bookitfast/v1', '/properties', array(
		'methods' => 'GET',
		'callback' => 'bookitfast_get_user_properties',
		'permission_callback' => '__return_true',
	));

	// Register the availability endpoint
	register_rest_route('bookitfast/v1', '/availability', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_check_availability',
		'permission_callback' => '__return_true',
	));

	// Register the availability summary endpoint
	register_rest_route('bookitfast/v1', '/availability/summary', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_get_availability_summary',
		'permission_callback' => '__return_true',
	));

	// Register the apply-discount endpoint
	register_rest_route('bookitfast/v1', '/multi/availability/apply-discount', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_apply_discount',
		'permission_callback' => '__return_true',
	));

	// Register the apply-gift-certificate endpoint
	register_rest_route('bookitfast/v1', '/apply-gift-certificate', array(
		'methods' => 'POST',
		'callback' => 'bookitfast_apply_gift_certificate',
		'permission_callback' => '__return_true',
	));
});

// Function to authenticate with Laravel API
function bookitfast_api_authenticate($email, $password) {
	$api_url = get_option('bookitfast_api_url');
	if (!$api_url) {
		return new WP_Error('api_url_missing', 'Book It Fast API URL is not set.');
	}
	$test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

	$response = wp_remote_post("$api_url/api/login", [
		'body' => [
			'email' => $email,
			'password' => $password,
		],
		'sslverify' => !$test_mode, // Disable SSL verification for local testing
	]);

	if (is_wp_error($response)) {
		return $response;
	}

	$body = wp_remote_retrieve_body($response);
	$data = json_decode($body, true);

	if (isset($data['token'])) {
		return $data['token'];
	}

	return new WP_Error('invalid_credentials', 'Invalid email or password.');
}

function bookitfast_get_user_properties() {
	$token = bookitfast_get_token(); // Fetch stored token

	if (!$token) {
		return new WP_REST_Response(['success' => false, 'message' => 'No API token found.'], 401);
	}

	$properties = bookitfast_fetch_user_property_data($token);

	if (is_wp_error($properties)) {
		return new WP_REST_Response(['success' => false, 'message' => 'Error fetching properties.'], 500);
	}

	return new WP_REST_Response(['success' => true, 'properties' => $properties], 200);
}

function bookitfast_enqueue_gift_certificate_frontend() {
	if (has_block('bookitfast/gift-certificate')) {
		wp_enqueue_script(
			'bookitfast-gc-frontend',
			plugins_url('build/gift-certificate-frontend.js', __FILE__),
			array('wp-element'),
			filemtime(plugin_dir_path(__FILE__) . 'build/gift-certificate-frontend.js'),
			true
		);
	}
}
add_action('wp_enqueue_scripts', 'bookitfast_enqueue_gift_certificate_frontend');

function bookitfast_enqueue_block_editor_assets() {
	wp_enqueue_script(
		'bookitfast-gc-block-editor',
		plugins_url('build/gift-certificate.js', __FILE__),
		array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'),
		filemtime(plugin_dir_path(__FILE__) . 'build/gift-certificate.js')
	);
}
add_action('enqueue_block_editor_assets', 'bookitfast_enqueue_block_editor_assets');
