const { Client, Message } = require('discord.js');
const Moderator = new (require('discord-moderator'))(new Client());

/**
 * @param {Client} bot Discord Client
 * @param {Message} message Discord Message
 * @param {string[]} args Command Arguments
 * @param {Moderator} moderator Moderator Class
*/
module.exports.run = async (bot, message, args, moderator) => {
    let member = message.mentions.members.last();
    if(!member) return message.reply('specify user for tempmuting!');

    let muteTime = args[1];
    if(!muteTime) return message.reply('specify tempmute time!');

    let reason = args.slice(2).join(' ');
    if(!reason) return message.reply('specify reason for muting!');

    moderator.tempmute(member, message.channel, '842713253103927346', muteTime, reason)
    .then(data => {
        return message.channel.send(`${member} was muted for **${muteTime}** due to **${reason}**!`);
    })
    .catch(err => {
        return message.reply(err.message);
    })
}

module.exports.help = {
    name: 'tempmute'
}