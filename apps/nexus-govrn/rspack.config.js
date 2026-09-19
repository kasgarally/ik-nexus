/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor Rspack client bundler
 */
const path = require('path');
const { defineConfig } = require('@meteorjs/rspack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = defineConfig(Meteor => {
  const nexusAliases = {
    '@nexus/accounts': path.resolve(__dirname, 'node_modules/@nexus/accounts'),
    '@nexus/applog': path.resolve(__dirname, 'node_modules/@nexus/applog'),
    '@nexus/files': path.resolve(__dirname, 'node_modules/@nexus/files'),
    '@nexus/lists': path.resolve(__dirname, 'node_modules/@nexus/lists'),
    '@nexus/setup': path.resolve(__dirname, 'node_modules/@nexus/setup'),
  };
  return {
    resolve: {
      // file: junctions resolve into /packages. Server and client both need
      // the app node_modules copy — Docker does not copy package node_modules.
      symlinks: false,
      alias: {
        ...nexusAliases,
        ...Meteor.isClient && {
          '@mdi/font': path.resolve(__dirname, 'node_modules/@mdi/font'),
          'node_modules/buffer/': path.resolve(__dirname, 'imports/bufferStub.js'),
          'node_modules/buffer': path.resolve(__dirname, 'imports/bufferStub.js'),
        },
      },
    },
    ...Meteor.isClient && {
      plugins: [new VueLoaderPlugin()],
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            include: [
              path.resolve(__dirname),
              path.resolve(__dirname, 'node_modules/@nexus/ui'),
              path.resolve(__dirname, '../../packages/ui'),
            ],
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
      // Chrome reports a benign ResizeObserver loop when Vuetify remounts
      // drawer + tables after auth → web. Keep compile errors on the overlay;
      // hide only that runtime warning so it does not cover the page.
      devServer: {
        client: {
          overlay: {
            runtimeErrors: function (error) {
              const message = error && error.message ? error.message : String(error || '');
              return !/ResizeObserver loop/i.test(message);
            },
          },
        },
      },
    },
  };
});
