// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Level files live in content/ and are parsed at build time by metro/yaml-transformer.js,
// so the app imports the repo's YAML directly instead of keeping a second copy of it.
// Expo's defaults treat .yaml/.yml as assets (Metro would hand the app a URL
// instead of the data), so move them from assetExts to sourceExts first.
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'yaml' && ext !== 'yml',
);
config.resolver.sourceExts = [...config.resolver.sourceExts, 'yaml', 'yml'];
config.transformer.babelTransformerPath = path.resolve(__dirname, 'metro/yaml-transformer.js');

module.exports = config;
