const { Message } = require('discord.js');

module.exports = {
  name: "mute",
  description: "Выдаёт мут пользователю",
  
  /**
    @param {Message} message
  */
  async run(message, args) {
    let user = message.mentions.users.first();
    let reason = args.slice(1).join(' ');
    
    if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи мута!`);
    if(!reason) reason = "Причина не указана.";
    
    message.bot.moderator.mute(message.guild.members.get(user.id), {
      channel: message.channel,
      author: message.member,
      reason: reason,
      mutedRoleID: "ID Мут-Роли"
    }).then(() => {
      if(message.guild.member(user).roles.get('ID мут-роли')) return message.channel.send(`${user} уже заглушён!`);
      return message.channel.send(`Пользователь ${user} был заглушен ${message.author}!\nПричина: **${reason}**`);
    });
  }
}
