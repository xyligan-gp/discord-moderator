const { Message } = require('discord.js');

module.exports = {
  name: "warn",
  description: "Выдаёт предупреждение пользователю",
  
  /**
    @param {Message} message
  */
  async run(message, args) {
    let user = message.mentions.users.first();
    let reason = args.slice(1).join(' ');
    
    if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи варна!`);
    if(!reason) reason = "Причина не указана.";
    
    message.bot.moderator.warn(message.guild.members.get(user.id), {
      channel: message.channel,
      author: message.member,
      reason: reason
    });
  }
}
