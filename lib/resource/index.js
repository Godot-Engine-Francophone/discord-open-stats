const path = require('path')
const config = require('config')

const layers = {
  // TODO:
  // No need for database atm, uncomment it when needed
  // database: require('./database'),
  logger: require('./logger'),
  discord: require('./discord'),
  google: require('./google'),
  server: require('./server')
}

let resources = {
  /**
   * Retrieves or initializes resources with passed config
   * ; Will initialize resources if callback is passed, will return object otherwise
   * @param {function} [init] - Triggers (re-)initialization of resources
   */
  init () {
    let promises = []

    // Aggregate all layers to be (re-)initialized
    for (let layer in layers) {
      // Prompt (re-)initialization of resources specified in config
      if (config.has(layer)) {
        promises.push(layers[layer](config.get(layer)))
      }
    }

    return Promise.all(promises)
      .then((results) => {
        results.forEach((result) => {
          // We store the returned resources in a require-persisted object
          // Standard result from a layer init is [name, resource]
          resources[result[0]] = result[1]
        })

        return resources
      })
  },
  
  health () {
    let healthy = {}

    for (let layer in layers) {
      if (resources[layer].health != null) {
        healthy[layer] = resources[layer].health
      } else {
        healthy[layer] = true
      }
    }

    return healthy
  }
}

module.exports = resources
