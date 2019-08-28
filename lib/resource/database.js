const pg = require('pg')
const dbMigrate = require('db-migrate')

function initializer (options) {
  const database = new DatabaseResource(options)
  return database.initPromise
    .then(() => ['database', database])
}

class DatabaseResource {
  /**
   * The initialization promise
   * @type {Promise<void>}
   */
  get initPromise () {
    return this._initPromise
  }

  /**
   * Establish a connection pool to the database and run migrations
   * @param {Object} options - Database configuration
   * @returns {Promise}
   */
  constructor (options) {
    const dbConfig = {
      config: {
        defaultEnv: 'options',
        options
      }
    }

    this.pgPool = new pg.Pool(options)
    this.ready = false

    this.pgPool.on('error', (err) => {
      this.ready = false

      if (err.client) {
        console.error('Connection lost', err)
      } else {
        console.error('Server error', 'Database connection error', err)
      }
    })

    this.pgPool.on('connect', () => {
      this.ready = true

      console.info(`Database connection created`)
    })

    // In the case of a connection problem, db-migrate crashes the process
    this._initPromise = dbMigrate.getInstance(true, dbConfig)
      .up()
  }

  get health () {
    return this.ready
  }

  /**
   * Query the database
   * @param {string} query - The prepared SQL query
   * @param {*[]} [params] - The list of params to bind to the prepared SQL query
   * @returns {Promise<Object>} The query result
   */
  query (query, params) {
    return this.initPromise
      .then(() => this.pgPool.query(query, params))
  }
}

module.exports = initializer
