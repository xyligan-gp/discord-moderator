const { Message } = require('discord.js');

module.exports = {
  name: "unmute",
  description: "Снимает мут пользователю",
  
  /**
    @param {Message} message
  */
  async run(message, args) {
    let user = message.mentions.users.first();
    
    if(!user) return message.channel.send(`${message.author}, укажите пользователя для снятия мута!`);
    
    message.bot.moderator.unmute(message.guild.members.get(user.id), {
      channel: message.channel,
      author: message.member,
      mutedRoleID: "ID Мут-Роли"
    }).then(() => {
      if(!message.guild.member(user).roles.get('ID мут-роли')) return message.channel.send(`${user} уже заглушён!`);
      return message.channel.send(`Пользователь ${user} был разглушен ${message.author}!*`);
    });
  }
}
