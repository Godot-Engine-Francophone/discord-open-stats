const Discord = require('discord.js')

function initializer (options) {
  const discord = new DiscordResource(options)
  return discord.initPromise
    .then(() => ['discord', discord])
}

class DiscordResource {

  constructor (options) {
    this.client = new Discord.Client()
    this._initPromise = this.client.login(options.token)
    this.ready = false

    this.client.on('ready', () => {
      this.ready = true

      console.log(`Logged in as ${this.client.user.tag}!`)
    })

    this.client.on('resume', () => {
      this.ready = true

      console.log(`Connection resumed in as ${this.client.user.tag}!`)
    })

    this.client.on('disconnect', () => {
      this.ready = false

      console.log(`Disconnected as ${this.client.user.tag}!`)
    })

    this.client.on('reconnecting', () => {
      this.ready = false

      console.log(`Reconnecting...`)
    })
  }

  get initPromise () {
    return this._initPromise
  }

  get health () {
    return this.ready
  }

}

module.exports = initializer
