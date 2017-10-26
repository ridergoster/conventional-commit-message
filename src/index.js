const packageName = require('../package').name
const suffix = '-commit-message'
const name = packageName.split(suffix)[0]

module.exports = (configuration) => {
  return {
    name: name,
    // TODO use functions from validate-commit-message
    // and from https://github.com/commitizen/cz-conventional-changelog
    parse: require('./valid-message').parse(configuration),
    validate: require('./valid-message').validate(configuration),
    prompter: require('cz-conventional-changelog').prompter
  }
}
