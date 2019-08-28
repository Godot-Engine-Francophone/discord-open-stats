const path = require('path')
const Joi = require('joi')
const Boom = require('boom')
const resources = require('../../resource')

const directory = path.basename(path.dirname(__filename)).replace('_root', '')
const prefix = directory ? `/${directory}` : '/'

function handler (request, h) {
  return resources.health()
}

module.exports = {
  method: 'GET',
  path: `${prefix}health`,
  handler,
  options: {
    description: `HealthCheck`,
  }
}
