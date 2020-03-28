const webpack = require('webpack');
const path = require('path');
const baseConfig = require('./webpack.config');
const merge = require('webpack-merge');
const NodemonPlugin = require( 'nodemon-webpack-plugin' );

const common = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [{
            test: /\.js$/,
            use: ["source-map-loader"],
            enforce: "pre"
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            MODE: JSON.stringify('DEV')
        })
    ]
}

module.exports = [
    merge.smart(baseConfig.client, common), 
    merge.smart(baseConfig.server, common, {
        plugins: [
            new NodemonPlugin({
                watch: path.resolve(__dirname, './dist'),
                nodeArgs: ['--inspect=127.0.0.1:9229']
            })
        ]
    })
]