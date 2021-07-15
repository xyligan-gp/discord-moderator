const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'blacklist-remove',
    aliases: ['b-remove'],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const member = message.mentions.members.last() || args.join(' ');
        
        client.moderator.blacklist.remove(message.guild, member)
        .then(data => {
            if(!data.status) return message.channel.send(`${message.author}, an error occurred while removing a user!`);
            return message.channel.send(`${message.author}, the user was successfully removed from the server blacklist.`);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}