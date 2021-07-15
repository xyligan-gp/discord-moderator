const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'blacklist-add',
    aliases: ['b-add'],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const member = message.mentions.members.last() || args[0];
        const reason = args.slice(1).join(' ');

        client.moderator.blacklist.add(message.guild, member, reason, message.author.id)
        .then(data => {
            if(!data.status) return message.channel.send(`${message.author}, an error occurred while adding a user!`);
            return message.channel.send(`${message.author}, the user was successfully added to the server blacklist.`);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}