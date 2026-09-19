/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * PM2 process file for a Linux-built Meteor bundle
 *
 * Secrets stay in the env file (0600). This file must not list API keys.
 *
 *   export NEXUS_APP_NAME=nexus-govrn   # folder under apps/
 *   pm2 start deploy/pm2/ecosystem.config.cjs
 *   pm2 save
 */

const home = process.env.HOME || '/home/nexus';
const appName = process.env.NEXUS_APP_NAME || 'nexus-govrn';
const appRoot = process.env.NEXUS_APP_ROOT || `${home}/apps/${appName}`;
const envFile = process.env.NEXUS_ENV_FILE || `${home}/etc/${appName}.env`;

module.exports = {
  apps: [
    {
      name: appName,
      cwd: `${appRoot}/bundle`,
      script: 'main.js',
      interpreter: 'node',
      // Node 24 loads the overlay before Meteor reads process.env.
      node_args: `--env-file=${envFile}`,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 20,
      exp_backoff_restart_delay: 200,
      time: true,
      out_file: `${home}/.pm2/logs/${appName}-out.log`,
      error_file: `${home}/.pm2/logs/${appName}-error.log`,
      merge_logs: true,
    },
  ],
};
