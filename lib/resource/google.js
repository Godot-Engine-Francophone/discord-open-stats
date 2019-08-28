const ua = require('universal-analytics')
const uuidv4 = require('uuid/v4')

class GoogleResource {
  /**
   * Create the google object
   * @param {Object} options - Google configuration
   * @returns {Promise}
   */
  constructor (options) {
    this.client = ua(options.trackerID, uuidv4())
  }

  send (category, action, label, value) {
    return this.client.event(category, action, label, value).send()
  }
}

module.exports = (options) => Promise.resolve(['google', new GoogleResource(options)])
