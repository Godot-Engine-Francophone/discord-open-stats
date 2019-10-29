const ua = require('universal-analytics')
const uuidv4 = require('uuid/v4')

class GoogleResource {
  /**
   * Create the google object
   * @param {Object} options - Google configuration
   * @returns {Promise}
   */
  constructor (options) {
    this.batchedItems = {
      amount: 0,
      items: null,
      quota: options.session.quota,
      batchedItems: options.session.batchedItems,
    }
    this.events = 0
    this.client = ua(options.trackerID, uuidv4())
  }

  resetSession () {
    this.events = 0

    if (this.batchedItems.items != null) {
      this.batchedItems.items.send()
      this.batchedItems.items = null
      this.batchedItems.amount = 0
    }

    this.client = ua(options.trackerID, uuidv4())
  }

  send (category, action, label, value) {
    let result = null

    this.batchedItems.amount++
    this.events++

    if (this.events >= this.batchedItems.quota) {
      this.resetSession()
    }

    if (this.batchedItems.amount > this.batchedItems.batchedItems) {
      result = this.batchedItems.items.event(category, action, label, value).send()

      this.batchedItems.items = null
      this.batchedItems.amount = 0
    } else if (this.batchedItems.items != null) {
      this.batchedItems.items = this.batchedItems.items.event(category, action, label, value)

      result = this.batchedItems.items
    } else {
      this.batchedItems.items = this.client.event(category, action, label, value)

      result = this.batchedItems.items
    }

    return result
  }
}

module.exports = (options) => Promise.resolve(['google', new GoogleResource(options)])
