const resources = require('../../resource')
const config = require('config').get('management')

const { RichEmbed, Emoji, MessageReaction } = require('discord.js')
const ERASE_ALL_ROLES = '__ERASE_ALL__'

class Discord {


  constructor() {
    this.message_created = false

    console.log(`Enable discord management? ${config.enabled}`)

    if (config.enabled == 1) {
      resources.discord.client.on('messageReactionAdd', (messageReaction, user) => {
        if (!user.bot && messageReaction.message.guild.id == `${config.server}`) {
          let emojiString = messageReaction.emoji.toString()
          let role_index = config.reactions.findIndex((item) => item == emojiString)

          if (role_index < 0) {
            // Guardian clause
            // If the role has not been found, close it
            messageReaction.remove(user)
            return
          }

          let role_id = config.roles[role_index]
          let member = messageReaction.message.guild.members.get(user.id)

          if (role_id == ERASE_ALL_ROLES) {
            config.roles.forEach((role_id) => {
              if (role_id != ERASE_ALL_ROLES) {
                this.removeRoleFromUser(user, member, role_id, config.retryAttempt)
              }
            })
          } else {
            this.addRoleToUser(user, member, role_id, config.retryAttempt)
          }
        } else {
          console.log(`Not adding role to ${user.username}`)
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
  }

  removeRoleFromUser(user, member, role_id, retry) {
    if (!member.roles.has(role_id)) {
      console.log(`${user.username} already doesn't have the role ${role_id}`)
    } else {
      console.log(`Removing role ${role_id} from ${user.username}`)
      member.removeRole(role_id, 'Reacted to the welcome message')
        .then((guildMember) => {
          console.log(`Role removed to ${guildMember.user.username}`)
        })
        .catch((err) => {
          console.log(err)
          console.log(`Retrying ${retry} times.`)

          setTimeout(this.removeRoleFromUser.bind(this, user, member, role_id), config.retryDelay, retry - 1)
        })
    }
  }

  addRoleToUser(user, member, role_id, retry) {
    if (member.roles.has(role_id)) {
      console.log(`${user.username} already has the role ${role_id}`)
    } else {
      console.log(`Adding role to ${user.username}`)
      member.addRole(role_id, 'Reacted to the welcome message')
        .then((guildMember) => {
          console.log(`Role added to ${guildMember.user.username}`)
        })
        .catch((err) => {
          console.log(err)
          console.log(`Retrying ${retry} times.`)

          setTimeout(this.addRoleToUser.bind(this, user, member, role_id), config.retryDelay, retry - 1)
        })
    }
  }

  generateMessage() {
    if (this.message_created) {
      // Message has already been sent,
      // There is no need to send a new one
      return
    }

    let guild = resources.discord.client.guilds.get(`${config.server}`)
    let channel = resources.discord.client.channels.get(`${config.channel}`)
    let roleEmbed = new RichEmbed()
      .setDescription(config.embedMessage.replace('\\n', '\n'))
      .setFooter(config.embedFooter)
    let fields = config.roles.map((item, index) => {
      return {
        emoji: config.reactions[index],
        role: `${item}`
      }
    })

    roleEmbed.setColor(config.embedColor)

    for (const { emoji, role } of fields) {
      if (!guild.roles.has(role) && role != ERASE_ALL_ROLES) {
        console.error(`The role ${role} does not exist!`)
        return
      }
    }

    if (channel.type == 'text') {
      channel.fetchMessages()
        .then((messages) => {
          let fileteredMessages = messages.filter((message) => {
            // Remove only the bot's messages
            return message.author.id == resources.discord.client.user.id
          })
          // channel.bulkDelete(fileteredMessages)
          return fileteredMessages.array().length > 0 ? fileteredMessages.array()[0] : null
        })
        .catch((err) => {
          console.log('Error while doing Bulk Delete')
          console.log(err)
        })
        .then((message_to_edit) => {
          if (message_to_edit != null) {
            return message_to_edit.edit(roleEmbed)
          } else {
            return channel.send(roleEmbed)
          }
        })
        .then(async (item) => {
          for (const emoji of config.reactions) {
            const customCheck = resources.discord.client.emojis.find(e => e.name === emoji)
            
            if (!customCheck) await item.react(emoji)
            else await item.react(customCheck.id)
          }
        })
        .then(() => {
          this.message_created = true
        })
    }
  }
}

module.exports = new Discord()