#!/usr/bin/env node
/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Per-app Docker Compose runner
 *
 * Cross-platform helper for per-app Docker Compose stacks.
 *
 *   node docker/stack.mjs <command> [app] [flags]
 *   npm run docker -- <command> [app] [flags]
 *
 * Commands: apps, build, up, down, restart, logs, ps, certs
 * Flags:    --volumes (down), --no-wait (up), --force (certs)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dockerDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dockerDir, '..');
const composeFile = path.join(dockerDir, 'docker-compose.yml');
const appsDir = path.join(dockerDir, 'apps');

const COMMANDS = new Set(['apps', 'build', 'up', 'down', 'restart', 'logs', 'ps', 'certs']);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function usage() {
  console.log(`Usage: node docker/stack.mjs <command> [app] [flags]

Commands:
  apps                 List apps that have a docker/apps/<name>.env file
  build <app>          Build images
  up <app>             Build, start, and wait until HTTP is ready
  down <app>           Stop the stack (add --volumes to wipe Mongo data)
  restart <app>        Restart running services
  logs <app>           Tail compose logs (pass extra compose flags after --)
  ps <app>             Show container status
  certs <app>          Write a local self-signed TLS pair into docker/certs/<app>/

If only one app env file exists, <app> can be omitted.
`);
}

function listApps() {
  if (!fs.existsSync(appsDir)) {
    return [];
  }

  return fs.readdirSync(appsDir)
    .filter((name) => name.endsWith('.env'))
    .map((name) => name.slice(0, -'.env'.length))
    .sort();
}

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];
  const passthrough = [];
  let seeingPassthrough = false;

  for (const arg of argv) {
    if (seeingPassthrough) {
      passthrough.push(arg);
      continue;
    }
    if (arg === '--') {
      seeingPassthrough = true;
      continue;
    }
    if (arg.startsWith('--')) {
      flags.add(arg);
      continue;
    }
    positional.push(arg);
  }

  return { positional, flags, passthrough };
}

function resolveApp(requested) {
  const apps = listApps();
  if (requested) {
    if (!apps.includes(requested)) {
      fail(`Unknown app "${requested}". Known apps: ${apps.join(', ') || '(none)'}`);
    }
    return requested;
  }
  if (apps.length === 1) {
    return apps[0];
  }
  fail(`App name required. Known apps: ${apps.join(', ') || '(none)'}`);
}

function readEnvFile(appName) {
  const envFile = path.join(appsDir, `${appName}.env`);
  const values = {};

  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }

  return { envFile, values };
}

function assertAppExists(appName) {
  const appDir = path.join(repoRoot, 'apps', appName);
  if (!fs.existsSync(appDir)) {
    fail(`Missing Meteor app directory: ${appDir}`);
  }
}

function composeArgs(envFile, extraArgs) {
  return [
    'compose',
    '--project-directory',
    dockerDir,
    '-f',
    composeFile,
    '--env-file',
    envFile,
    ...extraArgs,
  ];
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    });
    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`${command} was not found on PATH.`));
        return;
      }
      reject(error);
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

function runDocker(args) {
  return runProcess('docker', args).catch((error) => {
    if (error.message.includes('was not found on PATH')) {
      throw new Error('docker was not found on PATH. Install Docker Desktop or the Docker CLI.');
    }
    throw error;
  });
}

function certDirFor(appName) {
  return path.join(dockerDir, 'certs', appName);
}

function opensslArgs(outputDir) {
  return [
    'req',
    '-x509',
    '-nodes',
    '-newkey',
    'rsa:2048',
    '-keyout',
    path.join(outputDir, 'privkey.pem'),
    '-out',
    path.join(outputDir, 'fullchain.pem'),
    '-days',
    '825',
    '-subj',
    '/CN=localhost',
    '-addext',
    'subjectAltName=DNS:localhost,IP:127.0.0.1',
  ];
}

async function generateCerts(appName, { force = false } = {}) {
  const certDir = certDirFor(appName);
  const certFile = path.join(certDir, 'fullchain.pem');
  const keyFile = path.join(certDir, 'privkey.pem');

  fs.mkdirSync(certDir, { recursive: true });

  if (!force && fs.existsSync(certFile) && fs.existsSync(keyFile)) {
    console.log(`TLS files already exist in ${certDir}. Re-run with --force to replace them.`);
    return certDir;
  }

  console.log(`Writing self-signed TLS files to ${certDir} ...`);
  try {
    await runProcess('openssl', opensslArgs(certDir));
  } catch (error) {
    if (!error.message.includes('was not found on PATH')) {
      throw error;
    }
    console.log('openssl not on PATH; generating certs with a Docker OpenSSL image ...');
    await runDocker([
      'run',
      '--rm',
      '-v',
      `${certDir}:/certs`,
      'alpine/openssl',
      'req',
      '-x509',
      '-nodes',
      '-newkey',
      'rsa:2048',
      '-keyout',
      '/certs/privkey.pem',
      '-out',
      '/certs/fullchain.pem',
      '-days',
      '825',
      '-subj',
      '/CN=localhost',
      '-addext',
      'subjectAltName=DNS:localhost,IP:127.0.0.1',
    ]);
  }

  console.log('Created fullchain.pem and privkey.pem');
  return certDir;
}

function waitForHttp(url, timeoutMs = 25 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs;
  const client = url.startsWith('https:') ? https : http;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = client.get(url, { rejectUnauthorized: false }, (response) => {
        response.resume();
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve();
          return;
        }
        retry();
      });
      request.on('error', retry);
      request.setTimeout(5000, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() >= deadline) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(attempt, 5000);
    };

    attempt();
  });
}

async function main() {
  const { positional, flags, passthrough } = parseArgs(process.argv.slice(2));
  const [command, requestedApp] = positional;

  if (!command || command === 'help' || flags.has('--help')) {
    usage();
    process.exit(command ? 0 : 1);
  }

  if (!COMMANDS.has(command)) {
    usage();
    fail(`Unknown command "${command}".`);
  }

  if (command === 'apps') {
    const apps = listApps();
    if (apps.length === 0) {
      console.log('No docker/apps/*.env files found.');
      return;
    }
    for (const app of apps) {
      console.log(app);
    }
    return;
  }

  const appName = resolveApp(requestedApp);
  const { envFile, values } = readEnvFile(appName);
  assertAppExists(appName);

  if (command === 'build') {
    console.log(`Building ik-nexus/${appName}:latest ...`);
    await runDocker(composeArgs(envFile, ['build', ...passthrough]));
    return;
  }

  if (command === 'up') {
    console.log(`Starting stack ${appName} ...`);
    await runDocker(composeArgs(envFile, ['up', '--build', '-d', ...passthrough]));

    if (flags.has('--no-wait')) {
      return;
    }

    const port = values.HTTP_PORT || '80';
    const url = values.ROOT_URL || `http://localhost:${port}`;
    console.log(`Waiting for ${url} ...`);
    try {
      await waitForHttp(url);
      console.log(`Stack is up at ${url}`);
    } catch (error) {
      await runDocker(composeArgs(envFile, ['logs', '--tail', '80'])).catch(() => {});
      throw error;
    }
    return;
  }

  if (command === 'down') {
    const extra = flags.has('--volumes') ? ['down', '--volumes'] : ['down'];
    await runDocker(composeArgs(envFile, [...extra, ...passthrough]));
    return;
  }

  if (command === 'restart') {
    await runDocker(composeArgs(envFile, ['restart', ...passthrough]));
    return;
  }

  if (command === 'logs') {
    await runDocker(composeArgs(envFile, ['logs', ...passthrough]));
    return;
  }

  if (command === 'ps') {
    await runDocker(composeArgs(envFile, ['ps', ...passthrough]));
    return;
  }

  if (command === 'certs') {
    await generateCerts(appName, { force: flags.has('--force') });
    const httpsPort = values.HTTPS_PORT || '443';
    const httpsUrl = httpsPort === '443'
      ? 'https://localhost'
      : `https://localhost:${httpsPort}`;
    console.log(`
Next:
  1. Set ROOT_URL=${httpsUrl} in docker/apps/${appName}.env
  2. Recreate NGINX so it loads the PEMs: npm run docker:up -- ${appName}
  3. Open ${httpsUrl} (browsers warn on this self-signed cert)
`);
  }
}

main().catch((error) => {
  fail(error.message);
});
