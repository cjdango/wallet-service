const common = [
  'tests/features/**/*.feature',
  '--require tests/**/*.ts',
  `--format-options '{"snippetInterface": "async-await"}'`,
  '--require-module ts-node/register',
].join(' ');

module.exports = {
  default: common,
};
