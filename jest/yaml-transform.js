// Jest's twin of metro/yaml-transformer.js: a .yaml file imports as its parsed value.
const yaml = require('js-yaml');

module.exports = {
  process(src) {
    return { code: `module.exports = ${JSON.stringify(yaml.load(src))};` };
  },
};
