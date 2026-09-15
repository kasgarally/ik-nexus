/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor Rspack client bundler
 */
const path = require('path');
const { defineConfig } = require('@meteorjs/rspack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = defineConfig(Meteor => {
  return {
    ...Meteor.isClient && {
      resolve: {
        alias: {
          '@mdi/font': path.resolve(__dirname, 'node_modules/@mdi/font'),
        },
      },
      plugins: [new VueLoaderPlugin()],
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              experimentalInlineMatchResource: true,
            },
          },
          {
            test: /\.css$/,
            type: 'css',
          },
          {
            test: /\.(woff2?|eot|ttf|otf)$/i,
            type: 'asset/resource',
          },
        ],
      },
    },
  };
});
