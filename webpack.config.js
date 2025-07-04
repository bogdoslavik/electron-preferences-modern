'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: './src/app/index.tsx',
	watchOptions: {
		ignored: /node_modules/,
	},
        output: {
                path: path.resolve(__dirname, 'dist', 'build'),
                filename: 'app.js',
        },
	performance: {
		maxAssetSize: 512000,
		maxEntrypointSize: 512000,
	},
	resolve: {
		extensions: [
			'.js', '.jsx', '.ts', '.tsx', '.scss',
		],
		modules: [
			path.resolve(__dirname, 'src'),
			path.resolve(__dirname, 'scss'),
			path.resolve(__dirname, 'node_modules'),
		],
		alias: {},
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'assets' },
			],
		}),
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx|ts|tsx)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [ '@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript' ],
						},
					},
				],
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader',
				],
			},
		],
	},
};
