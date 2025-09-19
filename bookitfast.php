<?php

/**
 * Plugin Name:     Book It Fast
 * Plugin URI:      https://wordpress.org/plugins/book-it-fast/
 * Description:     Connect your WordPress site with Book It Fast to display booking calendars, manage property availability, and handle reservations directly from your website.
 * Author:          book-it-fast
 * Author URI:      https://bookitfast.app
 * Text Domain:     book-it-fast
 * Domain Path:     /languages
 * Version:         1.0.1
 * Requires at least: 5.0
 * Tested up to:      6.8.2
 * Requires PHP:      7.4
 * License:          GPLv2 or later
 * License URI:      https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package         Bookitfast
 */

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

// Prevent direct access
if (!defined('ABSPATH')) {
	exit;
}

define('BOOKITFAST_PATH', plugin_dir_path(__FILE__));
define('BOOKITFAST_URL', plugin_dir_url(__FILE__));
define('BOOKITFAST_API_URL', 'https://bookitfast.app');

// Include core plugin files
require_once BOOKITFAST_PATH . 'includes/admin-menu.php';
require_once BOOKITFAST_PATH . 'includes/api.php';
require_once BOOKITFAST_PATH . 'includes/blocks.php';

// Activation hook
register_activation_hook(__FILE__, 'bookitfast_activate');

function bookitfast_activate()
{
	// Set default API URL if not already set
	//if (!get_option('bookitfast_api_url')) {
	update_option('bookitfast_api_url', 'https://bookitfast.app');
	//}
}

// Register REST API routes

// Function to authenticate with Laravel API
function bookitfast_api_authenticate($email, $password)
{
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

function bookitfast_get_user_properties()
{
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

function bookitfast_enqueue_gift_certificate_frontend()
{
	if (has_block('bookitfast/gift-certificate')) {
		wp_enqueue_script(
			'bookitfast-gc-frontend',
			plugins_url('build/gift-certificate-frontend.js', __FILE__),
			array('wp-element'),
			filemtime(plugin_dir_path(__FILE__) . 'build/gift-certificate-frontend.js'),
			true
		);

		wp_enqueue_style(
			'bookitfast-gc-frontend',
			plugins_url('assets/gift-certificate.css', __FILE__),
			array(),
			filemtime(plugin_dir_path(__FILE__) . 'assets/gift-certificate.css')
		);
	}
}
add_action('wp_enqueue_scripts', 'bookitfast_enqueue_gift_certificate_frontend');

function bookitfast_enqueue_block_editor_assets()
{
	wp_enqueue_script(
		'bookitfast-gc-block-editor',
		plugins_url('build/editor.js', __FILE__),
		array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'),
		filemtime(plugin_dir_path(__FILE__) . 'build/editor.js'),
		false // Editor scripts should load in header, not footer
	);
}
add_action('enqueue_block_editor_assets', 'bookitfast_enqueue_block_editor_assets');
