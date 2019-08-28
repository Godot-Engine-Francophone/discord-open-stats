const got = require('got')
const uuidv4 = require('uuid/v4')

class GoogleResource {
  /**
   * Create the google object
   * @param {Object} options - Google configuration
   * @returns {Promise}
   */
  constructor (options) {
    this.options = options
    this.identifier = uuidv4()
  }

  async send (category, action, label, value) {
    return got.post('http://www.google-analytics.com/collect', {
      // API Version.
      v: '1',

      // Tracking ID / Property ID.
      tid: this.options.trackerID,

      // Anonymous Client Identifier. Ideally, this should be a UUID that
      // is associated with particular user, device, or browser instance.
      cid: this.identifier,

      // Event hit type.
      t: 'event',

      // Event category.
      ec: category,

      // Event action.
      ea: action,

      // Event label.
      el: label,

      // Event value.
      ev: value
    }).then((data) => {
      console.debug(`Request sent (${data.statusCode})`)
    }).catch((err) => {
      console.error(`Cannot send data: ${err}`)
    })
  }
}

module.exports = (options) => Promise.resolve(['google', new GoogleResource(options)])
