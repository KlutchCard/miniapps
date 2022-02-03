const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('template');
//defaultConfig.watchFolders.push('dist/templates')


module.exports = defaultConfig;