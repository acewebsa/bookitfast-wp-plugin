import React from 'react';
import ReactDOM from 'react-dom';
import MultiEmbedForm from './components/MultiEmbedForm';
import '../assets/frontend.css';

// Expose MultiEmbedForm globally so other plugins (e.g., Divi module) can use it.
window.BookItFast = window.BookItFast || {};
window.BookItFast.MultiEmbedForm = MultiEmbedForm;

// Initialize the frontend component
document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('bif-book-it-fast-multi-embed');
	if (container) {
		// Get propertyIds as a string and ensure it's properly formatted
		const propertyIdsString = container.dataset.propertyIds || '';
		// Pass the raw string to the component, let it handle the splitting
		const showDiscount = container.dataset.showDiscount === 'true';
		const showSuburb = container.dataset.showSuburb === 'true';
		const showPostcode = container.dataset.showPostcode === 'true';
		const showRedeemGiftCertificate = container.dataset.showRedeemGiftCertificate === 'true';
		const showComments = container.dataset.showComments === 'true';
		const buttonColor = container.dataset.buttonColor || '#0073aa';
		const buttonTextColor = container.dataset.buttonTextColor || '#ffffff';
		const minNights = parseInt(container.dataset.minNights) || 1;
		const maxNights = parseInt(container.dataset.maxNights) || 14;
		const showPropertyImages = container.dataset.showPropertyImages === 'true';
		const includeIcons = container.dataset.includeIcons === 'true';
		const layoutStyle = container.dataset.layoutStyle || 'cards';
		const buttonIcon = container.dataset.buttonIcon || 'search';
		const searchLayout = container.dataset.searchLayout || 'default';
		const searchBoxRadius = parseInt(container.dataset.searchBoxRadius) || 60;
		const summaryLayout = container.dataset.summaryLayout || 'classic';
		const searchFormLayout = container.dataset.searchFormLayout || 'default';
		const propertySelectionLayout = container.dataset.propertySelectionLayout || 'cards';
		const yourDetailsLayout = container.dataset.yourDetailsLayout || 'classic';
		const termsLayout = container.dataset.termsLayout || 'classic';
		const autoSelectSingleProperty = container.dataset.autoSelectSingleProperty === 'true';

		ReactDOM.render(
			React.createElement(MultiEmbedForm, {
				propertyIds: propertyIdsString,
				showDiscount: showDiscount,
				showSuburb: showSuburb,
				showPostcode: showPostcode,
				showRedeemGiftCertificate: showRedeemGiftCertificate,
				showComments: showComments,
				buttonColor: buttonColor,
				buttonTextColor: buttonTextColor,
				minNights: minNights,
				maxNights: maxNights,
				showPropertyImages: showPropertyImages,
				includeIcons: includeIcons,
				layoutStyle: layoutStyle,
				buttonIcon: buttonIcon,
				searchLayout: searchLayout,
				searchBoxRadius: searchBoxRadius,
				summaryLayout: summaryLayout,
				searchFormLayout: searchFormLayout,
				propertySelectionLayout: propertySelectionLayout,
				yourDetailsLayout: yourDetailsLayout,
				termsLayout: termsLayout,
				autoSelectSingleProperty: autoSelectSingleProperty
			}),
			container
		);
	}
});
