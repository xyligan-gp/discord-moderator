const { Client, Collection } = require('discord.js');
const config = require('../config.json');
const prefix = config.prefix;
const Moderator = require('discord-moderator')

/**
 * @param {Client} bot Discord Client
 * @param {Collection} commands Client Commands
*/
module.exports.on = async (bot, commands) => {
    const moderator = new Moderator(bot, {
        mutesTableName: 'mutes',
        checkMutesCountdown: 10000,
        warnsTableName: 'warns'
    });

    bot.on('message', message => {
        if (message.author.bot) return;
        if (message.channel.type != 'text') return;
    
        let messageArray = message.content.split(" ");
        let command = messageArray[0];
        let args = messageArray.slice(1);
        let cmd = commands.get(command.slice(prefix.length));
        if (cmd && message.content.startsWith(prefix)) cmd.run(bot, message, args, moderator);
    })

    moderator.on('muteEnded', data => {
        bot.channels.cache.get(data.channelID).send(`<@${data.userID}> removed mute!`);
    })
}