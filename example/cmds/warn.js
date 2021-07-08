const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'warn',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const member = message.mentions.members.last();
        const reason = args.slice(1).join(' ');

        if(!member) return message.reply('specify user for warning!');
        if(!reason) return message.reply('specify reason for warning!');

        client.moderator.warns.add(member, message.channel, reason, message.author.id, '842713253103927346')
        .then(data => {
            return message.channel.send(`${member} issued warn for a reason **${reason}**`);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}