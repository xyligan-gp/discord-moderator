const { Message } = require('discord.js');
const ms = require('ms');

module.exports = {
  name: "tempmute",
  description: "Выдаёт временный-мут пользователю",
  
  /**
    @param {Message} message
  */
  async run(message, args) {
    let user = message.mentions.users.first();
    let time = args[1];
    let reason = args.slice(2).join(' ');
    
    if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи временного-мута!`);
    if(!time) return message.channel.send(`${message.author}, укажите время мута!`);
    if(!reason) reason = "Причина не указана.";
    
    message.bot.moderator.mute(message.guild.members.get(user.id), {
      time: ms(time),
      channel: message.channel,
      author: message.member,
      reason: reason,
      mutedRoleID: "ID Мут-Роли"
    }).then(() => {
      if(message.guild.member(user).roles.get('ID мут-роли')) return message.channel.send(`${user} уже заглушён!`);
      return message.channel.send(`Пользователь ${user} был заглушен ${message.author}!\nПричина: **${reason}**\nВремя мута: **${ms(time)}**`);
    });
  }
}
