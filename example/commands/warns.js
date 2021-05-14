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
    if(!member) return message.reply('specify user for getting warns!');

    moderator.getWarns(member)
    .then(data => {
        return message.channel.send(`Warns: **${data.warns}**`);
    })
    .catch(err => {
        return message.reply(err.message);
    })
}

module.exports.help = {
    name: 'warns'
}