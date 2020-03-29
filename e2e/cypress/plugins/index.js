/* eslint-disable */
/// <reference types="cypress" />
const wp = require('@cypress/webpack-preprocessor');
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, launchOptions) => {
    // args.push('--use-fake-device-for-media-stream');
    launchOptions.args.push('--use-fake-ui-for-media-stream');
    launchOptions.args.push(`--use-file-for-fake-video-capture=${__dirname}\\miss_am_qcif.y4m`);

    return launchOptions;
  });
  const options = { webpackOptions: require('../../webpack.config') };
  on('file:preprocessor', wp(options))
};