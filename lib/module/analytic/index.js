const resources = require('../../resource')
const uuidv4 = require('uuid/v4')

/**
 * ANALYTICS DES MESSAGES
 * - Quantité de messages (total)
 * - Nombre de message / heure / channel
 * - User actif / heure / channel
 *
 * ANALYTICS DES SERVEURS
 * - Nombre de nouveaux users
 * - Nombre de users qui quittent
 * - Nombre de users ayant envoyé un message qui quitte
 * - Nombre d'utilisateurs (unique) qui se connectent par jour
 *
 * ANALYTICS CALCULEES
 * - Combien de temps reste un user (Calculé)
 * - Ancienneté des users (Calculé)
 */

class Discord {
  constructor() {
    resources.discord.client.on('message', (data) => {
      resources.google.send('message', `${data.channel.parent.name}/${data.channel.name}`, 'Message send', 1)
    })

    resources.discord.client.on('guildMemberAdd', (member) => {
      console.log('A member has joined our discord server')

      resources.google.send('guild', 'member_join', 'Member Join', 1)
    })

    resources.discord.client.on('guildMemberRemove', (member) => {
      console.log('A member has left our discord server')

      resources.google.send('guild', 'member_leave', 'Member Leave', 1)
    })

    resources.discord.client.on('guildMemberAvailable', (member) => {
      console.log('A member connected to our discord server')

      resources.google.send('guild', 'member_connect', 'Member Connect', 1)
    })
  }
}

module.exports = new Discord()
