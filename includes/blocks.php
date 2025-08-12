<?php

// Exit if accessed directly
if (! defined('ABSPATH')) exit;

include_once(plugin_dir_path(__FILE__) . 'gift-certificate.php');
/**
 * Register all Gutenberg blocks
 */
add_action('init', function () {
	// Register editor script for multi-embed block
	wp_register_script(
		'bookitfast-multi-embed-block',
		plugins_url('../build/editor.js', __FILE__),
		['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
		filemtime(plugin_dir_path(__FILE__) . '../build/editor.js'),
		false // Editor scripts should load in header
	);

	// Register editor script for gift certificate block
	wp_register_script(
		'bookitfast-gift-certificate-block',
		plugins_url('../build/gift-certificate.js', __FILE__),
		['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate.js'),
		false // Editor scripts should load in header
	);

	// Register frontend script for multi-embed
	wp_register_script(
		'bookitfast-multi-embed-frontend',
		plugins_url('../build/frontend.js', __FILE__),
		['wp-element'],
		filemtime(plugin_dir_path(__FILE__) . '../build/frontend.js'),
		true
	);

	// Register frontend script for gift certificate
	wp_register_script(
		'bookitfast-gc-frontend',
		plugins_url('../build/gift-certificate-frontend.js', __FILE__),
		['wp-element'],
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate-frontend.js'),
		true
	);

	// Register the frontend styles
	wp_register_style(
		'bookitfast-multi-embed-styles',
		plugins_url('../build/frontend.css', __FILE__),
		[],
		filemtime(plugin_dir_path(__FILE__) . '../build/frontend.css')
	);

	// Register the multi-embed block
	register_block_type('bookitfast/multi-embed', [
		'editor_script' => 'bookitfast-multi-embed-block',
		'script' => 'bookitfast-multi-embed-frontend',
		'style' => 'bookitfast-multi-embed-styles',
		'render_callback' => 'bookitfast_render_multi_embed_block',
		'attributes' => [
			'propertyIds' => [
				'type' => 'string',
				'default' => ''
			],
			'showDiscount' => [
				'type' => 'boolean',
				'default' => false
			],
			'showSuburb' => [
				'type' => 'boolean',
				'default' => false
			],
			'showPostcode' => [
				'type' => 'boolean',
				'default' => false
			],
			'showRedeemGiftCertificate' => [
				'type' => 'boolean',
				'default' => false
			],
			'showComments' => [
				'type' => 'boolean',
				'default' => false
			],
			'buttonColor' => [
				'type' => 'string',
				'default' => '#0073aa'
			],
			'buttonTextColor' => [
				'type' => 'string',
				'default' => '#ffffff'
			],
			'minNights' => [
				'type' => 'number',
				'default' => 1
			],
			'maxNights' => [
				'type' => 'number',
				'default' => 14
			],
			'showPropertyImages' => [
				'type' => 'boolean',
				'default' => false
			],
			'includeIcons' => [
				'type' => 'boolean',
				'default' => false
			]
		]
	]);

	// Register the gift certificate block
	/*register_block_type('bookitfast/gift-certificate', [
		'editor_script' => 'bookitfast-gift-certificate-block',
		'script' => 'bookitfast-gc-frontend',
		'style' => 'bookitfast-multi-embed-styles',
		'render_callback' => 'bookitfast_render_gift_certificate_block',
		'attributes' => [
			'buttonColor' => [
				'type' => 'string',
				'default' => '#00a80f'
			]
		]
	]);*/
});

// Ensure styles and scripts are enqueued on the frontend
add_action('wp_enqueue_scripts', function () {
	// Check which blocks are present on the page
	$has_multi_embed = has_block('bookitfast/multi-embed');
	$has_gift_certificate = has_block('bookitfast/gift-certificate');

	// Enqueue multi-embed styles and script if that block is present
	if ($has_multi_embed) {
		wp_enqueue_style('bookitfast-multi-embed-styles');
		wp_enqueue_script('bookitfast-multi-embed-frontend');
	}

	// Enqueue gift certificate styles and script if that block is present
	if ($has_gift_certificate) {
		wp_enqueue_style('bookitfast-gc-styles');
		wp_enqueue_script('bookitfast-gc-frontend');
	}
});

/**
 * Render callback for the "Book It Fast Multi Embed" block.
 */
function bookitfast_render_multi_embed_block($attributes)
{
	$propertyIds = isset($attributes['propertyIds']) ? esc_attr($attributes['propertyIds']) : '';
	$showDiscount = !empty($attributes['showDiscount']);
	$showSuburb = !empty($attributes['showSuburb']);
	$showPostcode = !empty($attributes['showPostcode']);
	$showRedeemGiftCertificate = !empty($attributes['showRedeemGiftCertificate']);
	$showComments = !empty($attributes['showComments']);
	$buttonColor = isset($attributes['buttonColor']) ? esc_attr($attributes['buttonColor']) : '#0073aa';
	$buttonTextColor = isset($attributes['buttonTextColor']) ? esc_attr($attributes['buttonTextColor']) : '#ffffff';
	$minNights = isset($attributes['minNights']) ? intval($attributes['minNights']) : 1;
	$maxNights = isset($attributes['maxNights']) ? intval($attributes['maxNights']) : 14;
	$showPropertyImages = !empty($attributes['showPropertyImages']);
	$includeIcons = !empty($attributes['includeIcons']);

	// Add inline CSS for button styling
	wp_add_inline_style('bookitfast-multi-embed-styles', "
		#bif-book-it-fast-multi-embed {
			--bif-button-color: {$buttonColor};
			--bif-button-color-hover: {$buttonColor}dd;
			--bif-button-color-active: {$buttonColor}bb;
			--bif-button-text-color: {$buttonTextColor};
		}
		#bif-book-it-fast-multi-embed .bif-btn-primary,
		#bif-book-it-fast-multi-embed .btn-primary {
			background-color: var(--bif-button-color) !important;
			border-color: var(--bif-button-color) !important;
			color: var(--bif-button-text-color) !important;
		}
		#bif-book-it-fast-multi-embed .bif-btn-primary:hover,
		#bif-book-it-fast-multi-embed .btn-primary:hover {
			background-color: var(--bif-button-color-hover) !important;
			border-color: var(--bif-button-color-hover) !important;
			color: var(--bif-button-text-color) !important;
		}
		#bif-book-it-fast-multi-embed .bif-btn-primary:active,
		#bif-book-it-fast-multi-embed .btn-primary:active {
			background-color: var(--bif-button-color-active) !important;
			border-color: var(--bif-button-color-active) !important;
			color: var(--bif-button-text-color) !important;
		}
	");

	ob_start();
?>
	<div id="bif-book-it-fast-multi-embed"
		data-property-ids="<?php echo esc_attr($propertyIds); ?>"
		data-show-discount="<?php echo esc_attr($showDiscount ? 'true' : 'false'); ?>"
		data-show-suburb="<?php echo esc_attr($showSuburb ? 'true' : 'false'); ?>"
		data-show-postcode="<?php echo esc_attr($showPostcode ? 'true' : 'false'); ?>"
		data-show-redeem-gift-certificate="<?php echo esc_attr($showRedeemGiftCertificate ? 'true' : 'false'); ?>"
		data-show-comments="<?php echo esc_attr($showComments ? 'true' : 'false'); ?>"
		data-button-color="<?php echo esc_attr($buttonColor); ?>"
		data-button-text-color="<?php echo esc_attr($buttonTextColor); ?>"
		data-min-nights="<?php echo esc_attr($minNights); ?>"
		data-max-nights="<?php echo esc_attr($maxNights); ?>"
		data-show-property-images="<?php echo esc_attr($showPropertyImages ? 'true' : 'false'); ?>"
		data-include-icons="<?php echo esc_attr($includeIcons ? 'true' : 'false'); ?>">
	</div>
<?php
	return ob_get_clean();
}

// Register the gift certificate block
function bookitfast_register_gift_certificate_block()
{
	// Note: External CDN resources removed for WordPress.org compliance
	// React and Stripe.js are bundled in the webpack build

	// Register the editor script
	wp_register_script(
		'bookitfast-gc-editor',
		plugins_url('../build/gift-certificate.js', __FILE__),
		array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate.js'),
		true
	);

	// Register the frontend script
	wp_register_script(
		'bookitfast-gc-frontend',
		plugins_url('../build/gift-certificate-frontend.js', __FILE__),
		array('wp-element'),
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate-frontend.js'),
		true
	);

	// Register gift certificate frontend styles
	wp_register_style(
		'bookitfast-gc-styles',
		plugins_url('../build/gift-certificate-frontend.css', __FILE__),
		[],
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate-frontend.css')
	);

	// Register the block
	register_block_type('bookitfast/gift-certificate', array(
		'editor_script' => 'bookitfast-gc-editor',
		'script' => 'bookitfast-gc-frontend',
		'style' => 'bookitfast-gc-styles',
		'render_callback' => 'bookitfast_render_gift_certificate_block',
		'attributes' => array(
			'buttonColor' => array(
				'type' => 'string',
				'default' => '#0073aa'
			),
			'buttonTextColor' => array(
				'type' => 'string',
				'default' => '#ffffff'
			)
		)
	));
}
add_action('init', 'bookitfast_register_gift_certificate_block');
