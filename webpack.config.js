const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
	...defaultConfig,
	entry: {
		// Editor block for multi-embed
		editor: path.resolve(process.cwd(), 'src', 'editor.js'),
		// Editor block for gift certificate
		'gift-certificate': path.resolve(process.cwd(), 'src', 'gift-certificate.js'),
		// Frontend JavaScript
		frontend: path.resolve(process.cwd(), 'src', 'frontend.js'),
		// Gift certificate frontend
		'gift-certificate-frontend': path.resolve(process.cwd(), 'src', 'gift-certificate-frontend.js'),
	},
	externals: {
		...defaultConfig.externals,
		// Ensure React is mapped to WordPress globals
		'react': 'React',
		'react-dom': 'ReactDOM',
		'react/jsx-runtime': 'ReactJSXRuntime',
	},
};
