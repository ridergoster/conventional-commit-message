'use strict'

const la = require('lazy-ass')
const check = require('check-more-types')
const util = require('util')

let ignored = ['^WIP\:']
let pattern = '^((?:fixup!\\s*)?(\\w*)(\\(([\\w\\$\\.\\*/-]*)\\))?\\: (.*))(\\n|$)'
let configuration = null
let max_length = 100
let types = {
  feat: true,
  fix: true,
  docs: true,
  style: true,
  refactor: true,
  perf: true,
  test: true,
  chore: true,
  revert: true
}

function _parseMessage (str) {
  if (configuration && configuration.pattern) {
    pattern = configuration.pattern
  }

  la(check.string(str), 'expected string message', str)
  const re = new RegExp(pattern)
  const match = re.exec(str)

  if (!match) {
    return
  }

  return {
    firstLine: match[1],
    type: match[2],
    scope: match[4],
    subject: match[5]
  }
}

function _validateMessage (message, log) {
  if (configuration && configuration.max_length) {
    max_length = configuration.max_length
  }
  if (configuration && configuration.types) {
    types = configuration.types
  }
  if (configuration && configuration.ignored) {
    ignored = ignored.concat(configuration.ignored)
  }
  if (!log) {
    log = console.error.bind(console)
  }

  function failedMessage () {
    // gitx does not display it
    // http://gitx.lighthouseapp.com/projects/17830/tickets/294-feature-display-hook-error-message-when-hook-fails
    // https://groups.google.com/group/gitx/browse_thread/thread/a03bcab60844b812
    log('INVALID COMMIT MSG: ' + util.format.apply(null, arguments))
  }

  let isIgnored = false

  ignored.forEach((str) => {
    const re = new RegExp(str)

    if (re.test(message)) {
      isIgnored = true
    }
  })

  if (isIgnored) {
    console.log('Commit message validation ignored.')
    return true
  }

  var parsed = _parseMessage(message)

  if (!parsed) {
    failedMessage('does not match "<type>(<scope>): <subject>" ! was: ' + message)
    return false
  }

  if (parsed.firstLine.length > max_length) {
    failedMessage('is longer than %d characters !', max_length)
    return false
  }

  if (!types.hasOwnProperty(parsed.type)) {
    failedMessage('"%s" is not allowed type !', parsed.type)
    return false
  }

  // Some more ideas, do want anything like this ?
  // - Validate the rest of the message (body, footer, BREAKING CHANGE annotations)
  // - allow only specific scopes (eg. fix(docs) should not be allowed ?
  // - auto correct the type to lower case ?
  // - auto correct first letter of the subject to lower case ?
  // - auto add empty line after subject ?
  // - auto remove empty () ?
  // - auto correct typos in type ?
  // - store incorrect messages, so that we can learn

  return true
}

function parseMessage (_configuration) {
  if (!configuration && _configuration) {
    configuration = _configuration
  }

  return _parseMessage
}

function validateMessage (_configuration) {
  if (!configuration && _configuration) {
    configuration = _configuration
  }

  return _validateMessage
}

module.exports = {
  validate: validateMessage,
  parse: parseMessage
}
