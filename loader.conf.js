'use strict';
const utils = require('./vue.utils');
const config = require('./env');
const isProduction = process.env.NODE_ENV === 'production';
const sourceMapEnabled = isProduction ? config.build.productionSourceMap : config.dev.cssSourceMap;

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction,
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href',
  },
  compilerOptions: {
    compatConfig: {
      MODE: 2,
    },
  },
};
