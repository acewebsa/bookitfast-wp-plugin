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
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules.map(rule => {
				// Modify babel-loader rule to use classic JSX transform
				if (rule.test && rule.test.toString().includes('jsx?')) {
					return {
						...rule,
						use: rule.use.map(use => {
							if (use.loader && use.loader.includes('babel-loader')) {
								return {
									...use,
									options: {
										...use.options,
										presets: [
											...(use.options.presets || []).map(preset => {
												if (Array.isArray(preset) && preset[0].includes('@babel/preset-react')) {
													return [preset[0], { ...preset[1], runtime: 'classic' }];
												}
												return preset;
											})
										]
									}
								};
							}
							return use;
						})
					};
				}
				return rule;
			})
		]
	}
};
