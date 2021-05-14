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
    if(!member) return message.reply('specify user for muting!');

    let reason = args.slice(1).join(' ');
    if(!reason) return message.reply('specify reason for muting!');

    moderator.mute(member, message.channel, '842713253103927346', reason)
    .then(data => {
        return message.channel.send(`${member} added mute. Reason: **${reason}**`);
    })
    .catch(err => {
        return message.reply(err.message);
    })
}

module.exports.help = {
    name: 'mute'
}