const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'mute',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const member = message.mentions.members.last();
        const reason = args.slice(1).join(' ') || null;

        if(!member) return message.reply('specify user for muting!');

        client.moderator.mutes.add(member, message.channel, '842713253103927346', reason)
        .then(data => {
            return message.channel.send(`${member} added mute. Reason: **${reason}**`);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}