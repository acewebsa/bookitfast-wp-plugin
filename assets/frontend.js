import { render } from '@wordpress/element';
import MultiEmbedForm from '../components/MultiEmbedForm';

// Find the container for rendering
const container = document.getElementById('book-it-fast-multi-embed');
if (container) {
	render(<MultiEmbedForm />, container);
}
