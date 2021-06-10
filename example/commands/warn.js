const { Client, Message, MessageEmbed } = require('discord.js');
const Moderator = new (require('discord-moderator'))(new Client());

/**
 * @param {Client} bot Discord Client
 * @param {Message} message Discord Message
 * @param {string[]} args Command Arguments
 * @param {Moderator} moderator Moderator Class
*/
module.exports.run = async (bot, message, args, moderator) => {
    let member = message.mentions.members.last();
    if(!member) return message.reply('specify user for warning!');

    let reason = args.slice(1).join(' ');
    if(!reason) return message.reply('specify reason for warning!');

    moderator.addWarn(member, message.channel, reason, message.author.id, '842713253103927346')
    .then(data => {
        return message.channel.send(`${member} issued warn for a reason **${reason}**`);
    })
    .catch(err => {
        return message.reply(err.message);
    })
}

module.exports.help = {
    name: 'warn'
}