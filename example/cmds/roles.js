const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'roles',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        client.moderator.roles.getAll(message.guild)
        .then(data => {
            return message.channel.send(data.map(role => `**${role.name}**`).join(', '));
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}