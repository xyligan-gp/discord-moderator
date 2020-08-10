const { Message } = require('discord.js');

module.exports = {
  name: "mute",
  description: "Выдаёт мут пользователю",
  
  /**
    @param {Message} message
  */
  async run(message, args) {
    let user = message.mentions.users.last();
    let reason = args.slice(1).join(' ');
    
    if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи мута!`);
    if(!reason) reason = "Причина не указана.";
    
    message.bot.moderator.mute(message.guild.members.cache.get(user.id), {
      channel: message.channel,
      author: message.member,
      reason: reason,
      mutedRoleID: "ID Мут-Роли"
    }).then(() => {
      if(user.roles.cache.get('ID Мут-Роли')) return message.channel.send(`${user} уже заглушён!`);
      return message.channel.send(`Пользователь ${user} был заглушен ${message.author}!\nПричина: **${reason}**`);
    });
  }
}
