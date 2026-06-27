// Metro config tuned for the Vaayu pnpm monorepo.
// It watches the repo root so changes in @vaayu/shared and @vaayu/supabase are
// picked up, and resolves modules from both the app and the hoisted root store.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo for changes in shared packages.
config.watchFolders = [workspaceRoot];

// Resolve dependencies from the app first, then the hoisted root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
