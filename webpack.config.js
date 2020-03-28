const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const common = {
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.svg'],
        symlinks: false
    },
    node: {
        Buffer: false
    },
    output: {
        path: path.resolve(__dirname, './dist')
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    modules: {
                        localIdentName: '[hash:base64:6]'
                    }
                }
            }, {
                loader: 'postcss-loader'
            }, {
                loader: 'sass-loader',
                options: {
                    implementation: require('sass'),
                },
            }]
        }, {
            test: /\.svg$/,
            loader: 'svg-inline-loader'
        },{
            //for external minimized modules only
            test: /\.css$/,
            use: [{
                loader: 'css-loader'
            }]
        }]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ]
}

module.exports = {
    client: merge.smart(common, {
        entry: {
            client: path.resolve(__dirname, './client/src/bootstrap.tsx')
        },
        resolve: {
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: path.resolve(__dirname, './client/tsconfig.json')
                })
            ]
        },
        output: {
            filename: 'assets/client.[chunkhash].js',
            chunkFilename: 'assets/[name].[chunkhash].js',
        },
        module: {
            rules: [{
                test: /\.(ts|tsx)?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, './client/tsconfig.json'),
                        transpileOnly: true,
                        experimentalWatchApi: true,
                        compilerOptions: {
                            sourceMap: true
                        }
                    }
                }]
            }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, './client/src/index.ejs'),
                chunksSortMode: 'none',
                inject: false,
                sw: true
            }),
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, './client/src/assets'),
                to: 'assets'
            }]),
            new ForkTsCheckerWebpackPlugin({
                tsconfig: path.resolve(__dirname, './client/tsconfig.json'),
                eslint: true
            })
        ]
    }),
    server: merge.smart(common, {
        target: 'node',
        entry: path.resolve(__dirname, './server/src/app.ts'),
        externals: [nodeExternals()],
        resolve: {
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: path.resolve(__dirname, './server/tsconfig.json')
                })
            ]
        },
        node: {
            __filename: true,
            __dirname: false
        },
        output: {
            filename: 'server.js'
        },
        module: {
            exprContextRegExp: /^\.\/.*$/,
            unknownContextRegExp: /^\.\/.*$/,
            rules: [{
                test: /\.(ts|tsx)?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'cache-loader'
                }, {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, './server/tsconfig.json'),
                        transpileOnly: true,
                        experimentalWatchApi: true,
                        compilerOptions: {
                            sourceMap: true
                        }
                    }
                }]
            }]
        },
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1
            }),
            new ForkTsCheckerWebpackPlugin({
                tsconfig: path.resolve(__dirname, './server/tsconfig.json'),
                eslint: true,
            })
        ]
    })
};
