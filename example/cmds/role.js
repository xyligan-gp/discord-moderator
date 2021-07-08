const ModeratorBot = require('../classes/Client.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'role',
    aliases: [],

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {Message} message Discord Message
     * @param {String[]} args Command Arguments
    */
    run: async(client, message, args) => {
        const role = message.mentions.roles.last() || args.join(' ');

        if(!role) return message.reply('specify role for getting information!');

        client.moderator.roles.get(message.guild, role)
        .then(data => {
            if(!data.status) return message.reply('role not found!');
            
            return message.channel.send(data.role.name);
        })
        .catch(err => {
            return message.reply(err.message);
        })
    }
}