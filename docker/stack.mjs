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

import { readSettingsJsonc } from '../scripts/build-settings.mjs';

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
  build <app>          Build images (also refreshes METEOR_SETTINGS)
  up <app>             Build, start, and wait until HTTP is ready
  down <app>           Stop the stack (add --volumes for named volumes; Mongo bind-mount data stays)
  restart <app>        Restart running services
  logs <app>           Tail compose logs (pass extra compose flags after --)
  ps <app>             Show container status
  certs <app>          Write a local self-signed TLS pair into docker/certs/<app>/

If only one committed app env file exists, <app> can be omitted.
`);
}

function listApps() {
  if (!fs.existsSync(appsDir)) {
    return [];
  }

  return fs.readdirSync(appsDir)
    .filter((name) => name.endsWith('.env') && !name.endsWith('.local.env'))
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

function parseEnvText(text) {
  const values = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    values[trimmed.slice(0, eq).trim()] = unquoteEnvValue(trimmed.slice(eq + 1).trim());
  }

  return values;
}

function unquoteEnvValue(raw) {
  if (
    (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2)
    || (raw.startsWith("'") && raw.endsWith("'") && raw.length >= 2)
  ) {
    const inner = raw.slice(1, -1);
    if (raw.startsWith('"')) {
      return inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return inner;
  }
  return raw;
}

function quoteEnvValue(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function committedEnvPath(appName) {
  return path.join(appsDir, `${appName}.env`);
}

function localEnvPath(appName) {
  return path.join(appsDir, `${appName}.local.env`);
}

function localEnvExamplePath(appName) {
  return path.join(appsDir, `${appName}.local.env.example`);
}

function readEnvFiles(appName) {
  const envFile = committedEnvPath(appName);
  const localFile = localEnvPath(appName);
  const values = parseEnvText(fs.readFileSync(envFile, 'utf8'));

  if (fs.existsSync(localFile)) {
    Object.assign(values, parseEnvText(fs.readFileSync(localFile, 'utf8')));
  }

  return { envFile, localFile, values };
}

function upsertEnvKey(filePath, key, value) {
  const line = `${key}=${quoteEnvValue(value)}`;

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${line}\n`);
    return;
  }

  const existing = fs.readFileSync(filePath, 'utf8');
  const rows = existing.split(/\r?\n/);
  let found = false;
  const next = rows.map((row) => {
    const trimmed = row.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return row;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      return row;
    }
    if (trimmed.slice(0, eq).trim() !== key) {
      return row;
    }
    found = true;
    return line;
  });

  if (!found) {
    const body = existing.replace(/\s*$/, '');
    fs.writeFileSync(filePath, `${body}${body ? '\n' : ''}${line}\n`);
    return;
  }

  fs.writeFileSync(filePath, `${next.join('\n').replace(/\s*$/, '')}\n`);
}

function ensureLocalEnv(appName) {
  const dest = localEnvPath(appName);
  if (fs.existsSync(dest)) {
    return dest;
  }

  const example = localEnvExamplePath(appName);
  if (fs.existsSync(example)) {
    fs.copyFileSync(example, dest);
    console.log(`Created ${path.relative(repoRoot, dest)} from ${path.basename(example)}`);
    return dest;
  }

  fs.writeFileSync(dest, [
    '# Author: Karmil Asgarally - INTELLEKTRA © 2026',
    `# Runtime overlay for ${appName} (gitignored)`,
    '',
  ].join('\n'));
  console.log(`Created empty ${path.relative(repoRoot, dest)}`);
  return dest;
}

function settingsJsoncPath(appName) {
  return path.join(repoRoot, 'apps', appName, 'settings.jsonc');
}

function injectMeteorSettings(appName) {
  const sourcePath = settingsJsoncPath(appName);
  if (!fs.existsSync(sourcePath)) {
    fail(`Missing ${sourcePath}. Cannot set METEOR_SETTINGS.`);
  }

  const settings = readSettingsJsonc(sourcePath);
  const localFile = ensureLocalEnv(appName);
  upsertEnvKey(localFile, 'METEOR_SETTINGS', JSON.stringify(settings));
  return { localFile, settings };
}

function isPublicHttpsRootUrl(rootUrl) {
  if (!rootUrl || !rootUrl.startsWith('https://')) {
    return false;
  }

  try {
    const parsed = new URL(rootUrl);
    return parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
  } catch {
    return true;
  }
}

function assertSafeProductionSettings(values, settings) {
  if (!isPublicHttpsRootUrl(values.ROOT_URL)) {
    return;
  }
  if (settings?.public?.devSeedAdmin === true) {
    fail('public.devSeedAdmin must be false when ROOT_URL is a public https URL.');
  }
  if (settings?.public?.devSeedUsers === true) {
    fail('public.devSeedUsers must be false when ROOT_URL is a public https URL.');
  }
}

function usesLocalMongo(values) {
  return !(values.MONGO_URL || '').trim();
}

function defaultMongoUrl(values) {
  const dbName = values.MONGO_DB || values.APP_NAME || 'meteor';
  return `mongodb://mongo:27017/${dbName}?replicaSet=rs0`;
}

function resolveMongoDataDir(values) {
  const raw = (values.MONGO_DATA_DIR || `./data/${values.APP_NAME}/mongo`).trim();
  return path.isAbsolute(raw) ? raw : path.resolve(dockerDir, raw);
}

function ensureMongoDataDir(values) {
  const dataDir = resolveMongoDataDir(values);
  fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

export function prepareAppRuntime(appName, { checkProductionSettings = false } = {}) {
  const { envFile, values } = readEnvFiles(appName);
  const { localFile, settings } = injectMeteorSettings(appName);
  const merged = { ...values, ...parseEnvText(fs.readFileSync(localFile, 'utf8')) };

  if (checkProductionSettings) {
    assertSafeProductionSettings(merged, settings);
  }

  const localMongo = usesLocalMongo(merged);
  if (localMongo) {
    const dataDir = ensureMongoDataDir(merged);
    console.log(`Local Mongo data directory: ${dataDir}`);
  } else {
    console.log('Hosted MONGO_URL is set; skipping in-stack mongo profile.');
  }

  return {
    envFile,
    localFile,
    values: merged,
    settings,
    localMongo,
  };
}

function assertAppExists(appName) {
  const appDir = path.join(repoRoot, 'apps', appName);
  if (!fs.existsSync(appDir)) {
    fail(`Missing Meteor app directory: ${appDir}`);
  }
}

function composeChildEnv(values, { localMongo }) {
  const childEnv = { ...process.env };
  childEnv.APP_NAME = values.APP_NAME;
  childEnv.HTTP_PORT = values.HTTP_PORT;
  childEnv.HTTPS_PORT = values.HTTPS_PORT;
  childEnv.ROOT_URL = values.ROOT_URL;
  childEnv.MONGO_DB = values.MONGO_DB;
  if (values.MONGO_DATA_DIR) {
    childEnv.MONGO_DATA_DIR = values.MONGO_DATA_DIR;
  }

  // Shell env wins over --env-file for Compose interpolation.
  // Empty MONGO_URL= in the overlay must not blank the in-stack default.
  childEnv.MONGO_URL = localMongo ? defaultMongoUrl(values) : values.MONGO_URL.trim();
  return childEnv;
}

function composeArgs({ envFile, localFile, withLocalMongoProfile }, extraArgs) {
  const args = [
    'compose',
    '--project-directory',
    dockerDir,
    '-f',
    composeFile,
    '--env-file',
    envFile,
  ];

  if (localFile && fs.existsSync(localFile)) {
    args.push('--env-file', localFile);
  }

  if (withLocalMongoProfile) {
    args.push('--profile', 'local-mongo');
  }

  args.push(...extraArgs);
  return args;
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

function runDocker(args, options = {}) {
  return runProcess('docker', args, options).catch((error) => {
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
  assertAppExists(appName);

  const needsSettings = command === 'build' || command === 'up';
  const runtime = needsSettings
    ? prepareAppRuntime(appName, { checkProductionSettings: command === 'up' })
    : readEnvFiles(appName);

  const values = runtime.values;
  const envFile = runtime.envFile;
  const localFile = runtime.localFile;
  const localMongo = Object.hasOwn(runtime, 'localMongo')
    ? runtime.localMongo
    : usesLocalMongo(values);

  const dockerEnv = composeChildEnv(values, { localMongo });
  const runCompose = (extraArgs, { profileForLocalMongo = localMongo } = {}) => runDocker(
    composeArgs({
      envFile,
      localFile,
      withLocalMongoProfile: profileForLocalMongo,
    }, extraArgs),
    { env: dockerEnv },
  );

  if (command === 'build') {
    console.log(`Building ik-nexus/${appName}:latest ...`);
    await runCompose(['build', ...passthrough]);
    return;
  }

  if (command === 'up') {
    console.log(`Starting stack ${appName} ...`);
    await runCompose(['up', '--build', '-d', ...passthrough]);

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
      await runCompose(['logs', '--tail', '80'], { profileForLocalMongo: true }).catch(() => {});
      throw error;
    }
    return;
  }

  if (command === 'down') {
    const extra = flags.has('--volumes') ? ['down', '--volumes'] : ['down'];
    // Always enable the profile so an in-stack mongo from a previous up is stopped.
    await runCompose([...extra, ...passthrough], { profileForLocalMongo: true });
    return;
  }

  if (command === 'restart') {
    await runCompose(['restart', ...passthrough], { profileForLocalMongo: true });
    return;
  }

  if (command === 'logs') {
    await runCompose(['logs', ...passthrough], { profileForLocalMongo: true });
    return;
  }

  if (command === 'ps') {
    await runCompose(['ps', ...passthrough], { profileForLocalMongo: true });
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

function sameFilesystemPath(left, right) {
  const a = path.normalize(left);
  const b = path.normalize(right);
  return process.platform === 'win32'
    ? a.toLowerCase() === b.toLowerCase()
    : a === b;
}

const invokedDirectly = process.argv[1]
  && sameFilesystemPath(fileURLToPath(import.meta.url), path.resolve(process.argv[1]));

if (invokedDirectly) {
  main().catch((error) => {
    fail(error.message);
  });
}
