const path = require('path');
const escape = require('escape-string-regexp');
const blacklist = require('metro-config/src/defaults/blacklist');
const pkg = require('../package.json');

const peerDependencies = Object.keys(pkg.peerDependencies);

module.exports = {
  projectRoot: __dirname,
  watchFolders: [path.resolve(__dirname, '..')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    blacklistRE: blacklist([
      new RegExp(
        `^${escape(path.resolve(__dirname, '..', 'node_modules'))}\\/.*$`
      ),
    ]),
    providesModuleNodeModules: ['@babel/runtime', ...peerDependencies],
  },
};
