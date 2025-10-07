import React from 'react';
import ReactDOM from 'react-dom';
import MultiEmbedForm from './components/MultiEmbedForm';
import '../assets/frontend.css';

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
				searchLayout: searchLayout
			}),
			container
		);
	}
});
