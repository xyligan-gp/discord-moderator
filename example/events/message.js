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
        muteSystem: true,
        warnSystem: true,

        muteConfig: {
            tableName: 'mutes',
            checkCountdown: 5000
        },

        warnConfig: {
            tableName: 'warns',
            maxWarns: 3,
            punishment: 'tempmute',
            muteTime: '12h'
        }
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

    moderator.on('kick', data => {
        console.log(data);
    })

    moderator.on('addWarn', data => {
        console.log(data);
    })

    moderator.on('addWarn', data => {
        console.log(data);
    })

    moderator.on('removeWarn', data => {
        console.log(data);
    })

    moderator.on('addMute', data => {
        console.log(data);
    })

    moderator.on('removeMute', data => {
        console.log(data);
    })

    moderator.on('muteEnded', data => {
        console.log(data);
    })
}