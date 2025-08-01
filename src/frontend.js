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

		ReactDOM.render(
			React.createElement(MultiEmbedForm, {
				propertyIds: propertyIdsString,
				showDiscount: showDiscount,
				showSuburb: showSuburb,
				showPostcode: showPostcode,
				showRedeemGiftCertificate: showRedeemGiftCertificate,
				showComments: showComments
			}),
			container
		);
	}
});
