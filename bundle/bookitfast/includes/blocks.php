<?php
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
		filemtime(plugin_dir_path(__FILE__) . '../build/editor.js')
	);

	// Register editor script for gift certificate block
	wp_register_script(
		'bookitfast-gift-certificate-block',
		plugins_url('../build/gift-certificate.js', __FILE__),
		['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate.js')
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
		plugins_url('../assets/frontend.css', __FILE__),
		[],
		filemtime(plugin_dir_path(__FILE__) . '../assets/frontend.css')
	);

	// Register the multi-embed block
	register_block_type('bookitfast/multi-embed', [
		'editor_script' => 'bookitfast-multi-embed-block',
		'script' => 'bookitfast-multi-embed-frontend',
		'style' => 'bookitfast-multi-embed-styles',
		'render_callback' => 'bookitfast_render_multi_embed_block',
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

	// Always enqueue styles if either block is present
	if ($has_multi_embed || $has_gift_certificate) {
		wp_enqueue_style('bookitfast-multi-embed-styles');
	}

	// Enqueue multi-embed script if that block is present
	if ($has_multi_embed) {
		wp_enqueue_script('bookitfast-multi-embed-frontend');
	}

	// Enqueue gift certificate script if that block is present
	if ($has_gift_certificate) {
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

	ob_start();
?>
	<div id="bif-book-it-fast-multi-embed"
		data-property-ids="<?php echo $propertyIds; ?>"
		data-show-discount="<?php echo $showDiscount ? 'true' : 'false'; ?>"
		data-show-suburb="<?php echo $showSuburb ? 'true' : 'false'; ?>"
		data-show-postcode="<?php echo $showPostcode ? 'true' : 'false'; ?>"
		data-show-redeem-gift-certificate="<?php echo $showRedeemGiftCertificate ? 'true' : 'false'; ?>"
		data-show-comments="<?php echo $showComments ? 'true' : 'false'; ?>">
	</div>
<?php
	return ob_get_clean();
}

// Register the gift certificate block
function bookitfast_register_gift_certificate_block()
{
	// Register React and ReactDOM
	wp_register_script(
		'react',
		'https://unpkg.com/react@17/umd/react.production.min.js',
		array(),
		'17.0.2',
		true
	);

	wp_register_script(
		'react-dom',
		'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
		array('react'),
		'17.0.2',
		true
	);

	// Register Stripe.js
	wp_register_script(
		'stripe-js',
		'https://js.stripe.com/v3/',
		array(),
		null,
		true
	);

	// Register the editor script
	wp_register_script(
		'bookitfast-gc-editor',
		plugins_url('../build/gift-certificate.js', __FILE__),
		array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'react', 'react-dom'),
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate.js'),
		true
	);

	// Register the frontend script
	wp_register_script(
		'bookitfast-gc-frontend',
		plugins_url('../build/gift-certificate-frontend.js', __FILE__),
		array('react', 'react-dom', 'stripe-js'),
		filemtime(plugin_dir_path(__FILE__) . '../build/gift-certificate-frontend.js'),
		true
	);

	// Register the block
	register_block_type('bookitfast/gift-certificate', array(
		'editor_script' => 'bookitfast-gc-editor',
		'script' => 'bookitfast-gc-frontend',
		'render_callback' => 'bookitfast_render_gift_certificate_block',
		'attributes' => array(
			'buttonColor' => array(
				'type' => 'string',
				'default' => '#0073aa'
			)
		)
	));
}
add_action('init', 'bookitfast_register_gift_certificate_block');
