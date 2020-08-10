const { Message } = require('discord.js');

module.exports = {
  name: "unmute",
  description: "Снимает мут пользователю",
  
  /**
    @param {Message} message
  */
  async run(message, args) {
    let user = message.mentions.users.last();
    
    if(!user) return message.channel.send(`${message.author}, укажите пользователя для снятия мута!`);
    
    message.bot.moderator.unmute(message.guild.members.cache.get(user.id), {
      channel: message.channel,
      author: message.member,
      mutedRoleID: "ID Мут-Роли"
    }).then(() => {
      if(!user.roles.cache.get('ID Мут-Роли')) return message.channel.send(`${user} уже разглушён!`);
      return message.channel.send(`Пользователь ${user} был разглушен ${message.author}!`);
    });
  }
}
