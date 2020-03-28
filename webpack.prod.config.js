const webpack = require('webpack');
const baseConfig = require('./webpack.config');
const merge = require('webpack-merge');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const runtimeCaching = require('./webpack.swcache');

const common = {
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            MODE: JSON.stringify('PROD')
        })
    ]
};

module.exports = [
    merge.smart(baseConfig.client, common),
    merge.smart(baseConfig.server, common, {
        optimization: {
            minimize: false
        }
    })
];
