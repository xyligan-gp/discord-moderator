const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'warns',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const member = message.mentions.members.last();
        if(!member) return message.reply('specify user for getting warns!');

        client.moderator.warns.getAll(member)
        .then(data => {
            return message.channel.send(`Warns: **${data.warns}**`);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}