'use strict';
const webpack = require('webpack');
const webpackMerge = require('webpack-merge').merge;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const utils = require('./vue.utils');
const config = require('./env');
const baseWebpackConfig = require('./webpack.common');
const jhiUtils = require('./utils.js');

const MODE = 'production';

const webpackConfig = {
  mode: MODE,
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,

      // if set to true, vuetify css will be overridden by bootstrap css.
      // some v-cards are to small in width for example
      extract: false,
      usePostCSS: true,
    }),
  },
  devtool: config.build.productionSourceMap ? config.build.web : false,
  entry: {
    global: './src/main/webapp/content/scss/global.scss',
    main: './src/main/webapp/app/main',
  },
  output: {
    path: jhiUtils.root('target/classes/static/'),
    filename: 'app/[name].[contenthash].bundle.js',
    chunkFilename: 'app/[id].[chunkhash].chunk.js',
  },
  optimization: {
    moduleIds: 'deterministic',
    minimizer: [
      '...',
      new CssMinimizerPlugin({
        parallel: true,
      }),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          arrows: false,
          collapse_vars: false,
          comparisons: false,
          computed_props: false,
          hoist_funs: false,
          hoist_props: false,
          hoist_vars: false,
          inline: false,
          loops: false,
          negate_iife: false,
          properties: false,
          reduce_funcs: false,
          reduce_vars: false,
          switches: false,
          toplevel: false,
          typeofs: false,
          booleans: true,
          if_return: true,
          sequences: true,
          unused: true,
          conditionals: true,
          dead_code: true,
          evaluate: true,
        },
        mangle: {
          safari10: true,
        },
      },
      parallel: true,
      extractComments: false,
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: 'content/[name].[contenthash].css',
      chunkFilename: 'content/[id].css',
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      base: '/',
      template: './src/main/webapp/index.html',
      chunks: ['vendors', 'main', 'global'],
      chunksSortMode: 'manual',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
    }),
    // keep module.id stable when vendor modules does not change
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        vue: {
          enabled: true,
          compiler: 'vue-template-compiler',
        },
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
      formatter: 'codeframe',
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      exclude: [/swagger-ui/],
    }),
  ],
};

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin');

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp('\\.(' + config.build.productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8,
    })
  );
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = async () => webpackMerge(await baseWebpackConfig({ env: MODE }), webpackConfig);
