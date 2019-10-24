const resources = require('../../resource')

/**
 * ANALYTICS DES MESSAGES
 * - Quantité de messages (total)
 * - Nombre de message / heure / channel
 * - User actif / heure / channel
 *
 * ANALYTICS DES SERVEURS
 * - Nombre de nouveaux users
 * - Nombre de users qui quittent
 * - Nombre de users ayant envoyé un message qui quitte!!
 * - Nombre d'utilisateurs (unique) qui se connectent par jour
 *
 * ANALYTICS CALCULEES
 * - Combien de temps reste un user (Calculé)
 * - Ancienneté des users (Calculé)
 */

class Analytic {
  constructor() {
    resources.discord.client.on('message', (data) => {
      
      if (!data.channel.parent) {
        return
      }

      if (data.author.bot) {
        resources.google.send('message', `${data.channel.parent.name}/${data.channel.name} (BOT)`, 'Message send (BOT)', 1)
      } else {
        resources.google.send('message', `${data.channel.parent.name}/${data.channel.name}`, 'Message send', 1)
      }
    })

    resources.discord.client.on('guildMemberAdd', (member) => {
      console.log('A member has joined our discord server')

      resources.google.send('guild', 'member_join', 'Member Join', 1)
    })

    resources.discord.client.on('guildMemberRemove', (member) => {
      console.log('A member has left our discord server')

      if (member.lastMessage != null) {
        resources.google.send('guild', 'member_leave', 'Member Leave', member.joinedTimestamp)
      } else {
        resources.google.send('guild', 'member_leave_without_message', 'Member Leave without message', member.joinedTimestamp)
      }
    })

    resources.discord.client.on('presenceUpdate', (oldMember, newMember) => {
      if (newMember.presence != null && newMember.presence.clientStatus != null) {
        console.log(`A member updated its platform: ${Object.keys(newMember.presence.clientStatus).join(', ')}`)

        Object.keys(newMember.presence.clientStatus).forEach((platform) => {
          resources.google.send('guild', `member_platform_${platform}`, 'Member Platform', 1)    
        })
      }
    })

    resources.discord.client.on('guildMemberAvailable', (member) => {
      console.log(`A member connected to our discord server`)

      resources.google.send('guild', 'member_connect', 'Member Connect', 1)

      if (member.presence != null && member.presence.clientStatus != null) {
        console.log(`A member connected to our discord server via ${Object.keys(member.presence.clientStatus).join(', ')}`)

        Object.keys(member.presence.clientStatus).forEach((platform) => {
          resources.google.send('guild', `member_platform_${platform}`, 'Member Platform', 1)    
        })
      }     
    })

    this._grabData()
  }

  _grabData() {
    let number_of_members = -1

    if (resources.discord.health) {
      let guildData = resources.discord.client.guilds.first(1)

      if (guildData.length > 0) {
        number_of_members = guildData[0].memberCount
      }
    }

    resources.google.send('guild', 'number_of_members', 'Number of members', number_of_members)

    // 10 minutes delay
    setTimeout((() => {
      return this._grabData()
    }).bind(this), 1000 * 60 * 10)
  }
}

module.exports = new Analytic()
