// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

// Apollo client workaround
// https://github.com/apollographql/apollo-client/blob/main/CHANGELOG.md#apollo-client-354-2021-11-19

const defaultConfig = getDefaultConfig(__dirname);

const defaultResolver = defaultConfig.resolver

defaultConfig.resolver = {
    ...defaultResolver,
    sourceExts: [
        ...defaultResolver.sourceExts,
        "cjs",
    ],
};
// END apollo workaround

module.exports = defaultConfig

