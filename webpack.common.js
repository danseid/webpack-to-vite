'use strict';
const path = require('path');
const { merge } = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { hashElement } = require('folder-hash');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const { DefinePlugin } = require('webpack');
const vueLoaderConfig = require('./loader.conf');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = async env => {
  const languagesHash = await hashElement(path.resolve(__dirname, '../src/main/webapp/i18n'), {
    algo: 'md5',
    encoding: 'hex',
    files: { include: ['*.json'] },
  });

  return merge(
    {
      mode: 'development',
      context: path.resolve(__dirname, '../'),
      entry: {
        app: './src/main/webapp/app/main.ts',
      },
      resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
          // vue: 'vue',
          //vue$: 'vue/dist/vue.esm.js',
          '@': resolve('src/main/webapp/app'),
        },
        fallback: {
          // prevent webpack from injecting useless setImmediate polyfill because Vue
          // source contains it (although only uses it if it's native).
          setImmediate: false,
          // prevent webpack from injecting mocks to Node native modules
          // that does not make sense for the client
          dgram: 'empty',
          fs: 'empty',
          net: 'empty',
          tls: 'empty',
          child_process: 'empty',
        },
      },
      cache: {
        // 1. Set cache type to filesystem
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '../target/webpack'),
        buildDependencies: {
          // 2. Add your config as buildDependency to get cache invalidation on config change
          config: [
            __filename,
            path.resolve(__dirname, `webpack.${env.env == 'development' ? 'dev' : 'prod'}.js`),
            path.resolve(__dirname, 'utils.js'),
            path.resolve(__dirname, '../.postcssrc.js'),
            path.resolve(__dirname, '../tsconfig.json'),
          ],
        },
      },
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: vueLoaderConfig,
          },
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  appendTsSuffixTo: ['\\.vue$'],
                  happyPackMode: true,
                  transpileOnly: true,
                },
              },
            ],
            include: [resolve('src'), resolve('test')],
          },
          // {
          //   test: /\.mjs$/,
          //   include: /node_modules/,
          //   type: 'javascript/auto',
          // },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'content/[hash].[ext]',
              publicPath: '../',
            },
          },
          {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'content/[hash].[ext]',
              publicPath: '../',
            },
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'content/[hash].[ext]',
              publicPath: '../',
            },
          },
        ],
      },
      plugins: [
        new DefinePlugin({
          I18N_HASH: JSON.stringify(languagesHash.hash),
          'process.env': require(env.env == 'development' ? './dev.env' : './prod.env'),
        }),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin({
          patterns: [
            {
              context: './node_modules/swagger-ui-dist/',
              from: '*.{js,css,html,png}',
              to: 'swagger-ui/',
              globOptions: { ignore: ['**/index.html'] },
            },
            { from: './node_modules/axios/dist/axios.min.js', to: 'swagger-ui/' },
            { from: './src/main/webapp/swagger-ui/', to: 'swagger-ui/' },
            { from: './src/main/webapp/content/', to: 'content/' },
            { from: './src/main/webapp/favicon.ico', to: 'favicon.ico' },
            {
              from: './src/main/webapp/manifest.webapp',
              to: 'manifest.webapp',
            },
            // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
            { from: './src/main/webapp/robots.txt', to: 'robots.txt' },
          ],
        }),
        new MergeJsonWebpackPlugin({
          output: {
            groupBy: [
              { pattern: './src/main/webapp/i18n/en/*.json', fileName: './i18n/en.json' },
              { pattern: './src/main/webapp/i18n/de/*.json', fileName: './i18n/de.json' },
              // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array
            ],
          },
        }),
      ],
    }
    // jhipster-needle-add-webpack-config - JHipster will add custom config
  );
};
