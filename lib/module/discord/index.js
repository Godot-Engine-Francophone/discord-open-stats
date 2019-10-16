const resources = require('../../resource')
const config = require('config').get('management')

const { RichEmbed, Emoji, MessageReaction } = require('discord.js')

class Discord {
  constructor() {
    resources.discord.client.on('messageReactionAdd', (messageReaction, user) => {
      if (!user.bot && messageReaction.message.guild.id == `${config.server}`) {
        let member = messageReaction.message.guild.members.get(user.id)

        member.addRole(config.roles[0])
      }
    })

    resources.discord.client.on('resume', () => {
      this.generateMessage()
    })

    resources.discord.client.on('ready', () => {
      this.generateMessage()
    })

    if (resources.discord.ready) {
      this.generateMessage()
    }
  }

  generateMessage() {
    let guild = resources.discord.client.guilds.get(`${config.server}`)
    let channel = resources.discord.client.channels.get(`${config.channel}`)
    let roleEmbed = new RichEmbed()
      .setDescription(config.embedMessage)
      .setFooter(config.embedFooter)
    let fields = config.roles.map((item, index) => {
      return {
        emoji: config.reactions[index],
        role: `${item}`
      }
    })

    roleEmbed.setColor(config.embedColor)

    for (const { emoji, role } of fields) {
      if (!guild.roles.has(role)) {
        console.error(`The role ${role} does not exist!`)
        return
      }
    }

    if (channel.type == 'text') {
      channel.fetchMessages()
        .then((messages) => {
          channel.bulkDelete(messages);
          let messagesDeleted = messages.array().length

          console.log(`Deletion of messages successful. Total messages deleted: ${messagesDeleted}`)
        })
        .catch((err) => {
          console.log('Error while doing Bulk Delete')
          console.log(err)
        })
        .then(channel.send.bind(channel, roleEmbed))
        .then(async (item) => {
          for (const r of config.reactions) {
            const emoji = r
            const customCheck = resources.discord.client.emojis.find(e => e.name === emoji)
            
            if (!customCheck) await item.react(emoji)
            else await item.react(customCheck.id)
          }
        })
    }
  }
}

module.exports = new Discord()