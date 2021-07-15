const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'blacklist',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        client.moderator.blacklist.getAll(message.guild)
        .then(data => {
            if(!data.status) return message.channel.send(`${message.author}, nothing was found in the database!`);
            return message.channel.send(data.data.map(block => `${block.userID} - ${block.blockReason}`));
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}