// Build-time YAML loader.
//
// Metro hands us the raw source of every module. For a .yaml/.yml file we parse it
// here and re-emit it as a plain JS module, so `import level from '../content/.../level-01-1.yaml'`
// gives the app the already-parsed object. The file under content/ is never copied,
// rewritten or transformed beyond YAML -> JS value.
const yaml = require('js-yaml');
const upstream = require('@expo/metro-config/babel-transformer');

function transform(params) {
  const { filename } = params;
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
    const src = params.src.toString();
    const value = yaml.load(src);
    return upstream.transform({
      ...params,
      src: `module.exports = ${JSON.stringify(value)};`,
    });
  }
  return upstream.transform(params);
}

module.exports = { transform, getCacheKey: upstream.getCacheKey };
