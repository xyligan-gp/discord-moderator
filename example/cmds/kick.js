const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'kick',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const member = message.mentions.members.last();
        const reason = args.slice(1).join(' ');

        if(!member) return message.reply('specify user for kicking!');
        if(!reason) return message.reply('specify reason for kicking!');

        client.moderator.punishments.kick(member, reason, message.author.id)
        .then(data => {
            return message.channel.send(`${member} successfully kicked. Reason: **${reason}**`);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}