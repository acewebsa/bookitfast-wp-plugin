const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		'editor': './src/index.js',
		'frontend': './src/frontend.js'
	},
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react']
					}
				}
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'@wordpress/element': 'wp.element',
		'@wordpress/blocks': 'wp.blocks',
		'@wordpress/components': 'wp.components',
		'@wordpress/block-editor': 'wp.blockEditor',
		'@wordpress/i18n': 'wp.i18n'
	}
};
