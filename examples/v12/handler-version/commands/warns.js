const { Message } = require('discord.js');

module.exports = {
  name: "warns",
  description: "Показывает количество предупреждений у пользователя",
  
  /**
    @param {Message} message
  */
  async run(message, args) {
    let user = message.mentions.users.last();
    
    if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи варна!`);
    
    message.bot.moderator.warns(message.guild.members.cache.get(user.id), {
      channel: message.channel,
      author: message.member
    });
  }
}
