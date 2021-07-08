const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'tempmute',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const member = message.mentions.members.last();
        const muteTime = args[1];
        const reason = args.slice(2).join(' ') || null;

        if(!member) return message.reply('specify user for tempmuting!');
        if(!muteTime) return message.reply('specify tempmute time!');

        client.moderator.mutes.temp(member, message.channel, '842713253103927346', muteTime, reason)
        .then(data => {
            return message.channel.send(`${member} successfully muted on **${muteTime}**. Reason: **${reason}**`);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}