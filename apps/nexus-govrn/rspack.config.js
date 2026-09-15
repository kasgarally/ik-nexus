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
        // file: installs @nexus/ui as a junction to packages/ui. Leave it
        // unresolved as a real path so vue / vue-i18n / vuetify walk up
        // through node_modules/@nexus/ui to this app's node_modules.
        symlinks: false,
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
    },
  };
});
