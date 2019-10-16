const config = require('config')
const resources = require('./resource')
const routeDirectories = require('./route')

const packageJson = require('../package.json')

// Note:
// Environment variable automatically loaded by Heroku
delete process.env.DATABASE_URL

// Initialize app components
Promise.resolve()
  .then(resources.init)
  .then(() => resources.server.register(require('inert')))
  .then(() => {
    // Initialize analytic module
    require('./module/analytic')
    require('./module/discord')

    resources.server.routes(routeDirectories)
    resources.server.start()
    console.info(`${packageJson.name} operational (${config.server.host}:${config.server.port}/)`)
  })
  .catch((err) => {
    console.error(`Could not initialize ${packageJson.name}.`)
    console.error(err)

    process.exit(1)
  })

process.on('unhandledRejection', err => {
    const msg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './')
  console.error('Unhandled Rejection', msg)
})
