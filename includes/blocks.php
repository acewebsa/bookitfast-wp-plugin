<?php
include_once( plugin_dir_path( __FILE__ ) . 'gift-certificate.php' );
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

	// Register frontend script
	wp_register_script(
		'bookitfast-multi-embed-frontend',
		plugins_url('../build/frontend.js', __FILE__),
		['wp-element'],
		filemtime(plugin_dir_path(__FILE__) . '../build/frontend.js'),
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

	// Register gift certificate block
	register_block_type('bookitfast/gift-certificate', [
		'render_callback' => 'bookitfast_render_gift_certificate_block',
	]);
});

// Ensure styles and scripts are enqueued on the frontend
add_action('wp_enqueue_scripts', function () {
	if (has_block('bookitfast/multi-embed') || has_block('bookitfast/gift-certificate')) {
		wp_enqueue_style('bookitfast-multi-embed-styles');
		wp_enqueue_script('bookitfast-multi-embed-frontend');
	}
});

/**
 * Render callback for the "Book It Fast Multi Embed" block.
 */
function bookitfast_render_multi_embed_block($attributes) {
	$propertyIds = isset($attributes['propertyIds']) ? esc_attr($attributes['propertyIds']) : '';
	$showDiscount = !empty($attributes['showDiscount']);
	$showSuburb = !empty($attributes['showSuburb']);
	$showPostcode = !empty($attributes['showPostcode']);
	$showRedeemGiftCertificate = !empty($attributes['showRedeemGiftCertificate']);
	$showComments = !empty($attributes['showComments']);

	ob_start();
	?>
	<div id="book-it-fast-multi-embed"
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
