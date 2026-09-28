<?php
/**
 * Block patterns for the Book It Fast plugin.
 *
 * @package Bookitfast
 */

if (!defined('ABSPATH')) {
    exit;
}

function bookitfast_register_patterns() {
    if (!function_exists('register_block_pattern') || !function_exists('register_block_pattern_category')) {
        return;
    }

    register_block_pattern_category('bookitfast', array(
        'label' => __('Book It Fast', 'book-it-fast'),
    ));

    // Hero with booking search (#01 from the pattern library): a full-width hero
    // headline + the BIF Availability Search, which sends the chosen dates to a
    // booking page (set the target in the Availability Search block settings).
    $hero = <<<'HTML'
<!-- wp:cover {"customOverlayColor":"#2c3e50","dimRatio":100,"minHeight":70,"minHeightUnit":"vh","align":"full","style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem","left":"1.5rem","right":"1.5rem"}}},"layout":{"type":"constrained","contentSize":"760px"}} -->
<div class="wp-block-cover alignfull" style="padding-top:4rem;padding-right:1.5rem;padding-bottom:4rem;padding-left:1.5rem;min-height:70vh"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim" style="background-color:#2c3e50"></span><div class="wp-block-cover__inner-container">
<!-- wp:paragraph {"align":"center","style":{"typography":{"letterSpacing":"3px","textTransform":"uppercase","fontSize":"13px","fontWeight":"600"},"color":{"text":"#c9aa7c"}}} -->
<p class="has-text-align-center has-text-color" style="color:#c9aa7c;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase">Book Direct &amp; Save</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"52px","lineHeight":"1.1"},"color":{"text":"#ffffff"}}} -->
<h1 class="wp-block-heading has-text-align-center has-text-color" style="color:#ffffff;font-size:52px;line-height:1.1">Your beach house awaits</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"18px"},"color":{"text":"#e8e8e8"},"spacing":{"margin":{"bottom":"2rem"}}}} -->
<p class="has-text-align-center has-text-color" style="color:#e8e8e8;font-size:18px;margin-bottom:2rem">Direct bookings, best rates, no booking fees.</p>
<!-- /wp:paragraph -->

<!-- wp:bookitfast/availability-search {"heading":"","buttonText":"Search Availability","targetUrl":"/booking/","pickerStyle":"range"} /-->
</div></div>
<!-- /wp:cover -->
HTML;

    register_block_pattern('bookitfast/hero-booking-search', array(
        'title'         => __('Hero with Booking Search', 'book-it-fast'),
        'description'   => _x('A full-width hero with a headline and the Book It Fast Availability Search. The search sends the chosen dates to your booking page — set the target page in the Availability Search block settings (default /booking/).', 'Block pattern description', 'book-it-fast'),
        'categories'    => array('bookitfast', 'header'),
        'keywords'      => array('hero', 'booking', 'search', 'availability', 'header'),
        'viewportWidth' => 1400,
        'content'       => $hero,
    ));
}
add_action('init', 'bookitfast_register_patterns');
