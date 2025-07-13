'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/app/index.tsx',

    devtool: 'source-map',

    cache: { type: 'filesystem' },

    watchOptions: { ignored: /node_modules/ },

    output: {
        path: path.resolve(__dirname, 'dist', 'build'),
        filename: 'app.js',
        clean: true,
    },

    performance: { maxAssetSize: 512e3, maxEntrypointSize: 512e3 },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        alias: {},
    },

    plugins: [
        new CopyWebpackPlugin({ patterns: [{ from: 'assets' }] }),
    ],

    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript',
                        ],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.svg$/i,
                type: 'asset/resource',
                generator: { filename: 'svg/[name][ext]' },
            },
        ],
    },
};
