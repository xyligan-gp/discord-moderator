const { Client } = require('discord.js');
const ms = require('ms');
const bot = new Client();

const { Moderator } = require('discord-moderator');

const moderator = new Moderator(bot, {
    storage: "./moderator.json",
    updateCountdownEvery: 5000,
    muteTable: 'muted',
    muteMessageType: 'message',
    muteEmbedColor: 'f80000',
    warnsTable: 'userWARNS',
    warnKickMessage: '{user} кикнут! Причина: **{reason}**',
    warnBanMessage: `{user} забанен! Причина: **{reason}**`,
    warnsMessageType: 'embed',
    warnsEmbedColor: 'RANDOM'
});
bot.moderator = moderator;

// Событие запуска бота
bot.once('ready', () => {
    console.log('Ready!');
});
// Mute Detect | Обход мута
bot.on('guildMemberAdd', member => {
	moderator.guildMemberAdd((member), {
		mutedRoleID: 'ID мут-роли'
	});
});

bot.on('message', async message => {
    const prefix = '/';
    
	let messageArray = message.content.split(' ');
	let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let args2 = args.join(" ").slice(22);
    
    // Команды Mute/Tempmute/Unmute
    if(cmd === `${prefix}mute`) {
	let reason = args2;
	let user = message.mentions.users.first();
	if(!user) return message.channel.send(`${message.author}, укажите пользователя для мута!`);
    if(!reason) return message.channel.send(`${message.author}, укажите время мута!`);
	moderator.mute(message.guild.members.get(user.id), {
            reason: reason,
	    author: message.member,
            channel: message.channel,
            mutedRoleID: 'ID мут-роли'
        }).then((muteData) => {
		if(message.guild.member(user).roles.get('ID мут-роли')) return message.channel.send(`${user} уже заглушён!`);
           	return message.channel.send(`${user} заглушён! Причина: **${reason}**`);
        }).catch(err => console.log(err))
    }else if(cmd === `${prefix}tempmute`) {
        let user = message.mentions.users.first();
        let time = args[1];
        let reason = args.slice(2);
        if(!user) return message.channel.send(`${message.author}, укажите пользователя для мута!`);
            if(!time) return message.channel.send(`${message.author}, укажите время мута!`);
        if(reason == undefined) return message.channel.send(`${message.author}, укажите причину мута!`);
        moderator.mute(message.guild.members.get(user.id), {
            time: ms(time),
            reason: reason.join(' '),
            author: message.member,
            channel: message.channel,
            mutedRoleID: 'ID мут-роли'
        }).then((muteData) => {
            if(message.guild.member(user).roles.get('ID мут-роли')) return message.channel.send(`${user} уже заглушён!`);
            return message.channel.send(`${user} заглушён на ${time}! Причина: **${reason.join(' ')}**`);
        }).catch(err => console.log(err))
    }else if(cmd === `${prefix}unmute`) {
        let user = message.mentions.users.first();
        if(!user) return message.channel.send(`${message.author}, укажите пользователя для размута!`);
        moderator.unmute(message.guild.members.get(user.id), {
            author: message.member,
            channel: message.channel,
            mutedRoleID: 'ID мут-роли'
        }).then((muteData) => {
            if(!message.guild.member(user).roles.get('698639775846105208')) return message.channel.send(`${user} уже разглушён!`);
            return message.channel.send(`${user} разглушён!`);
        }).catch(err => console.log(err))
    }else if(cmd === `${prefix}warn`) { // Команды Warn/Unwarn/Warns
        let reason = args2;
        let user = message.mentions.users.first();
        if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи варна!`);
        moderator.warn(message.guild.members.get(user.id), {
            channel: message.channel,
            author: message.member,
            reason: reason
        }).then((muteData) => {
            //your code
        });
    }else if(cmd === `${prefix}unwarn`) {
        let user = message.mentions.users.first();
        if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи предупреждения!`);
        moderator.unwarn(message.guild.members.get(user.id), {
            channel: message.channel,
            author: message.member
        }).then((muteData) => {
            //your code
        });
    }else if(cmd === `${prefix}warns`) {
        let user = message.mentions.users.first();
        if(!user) return message.channel.send(`${message.author}, укажите пользователя для выдачи предупреждения!`);
        moderator.warns(message.guild.members.get(user.id), {
            channel: message.channel,
            author: message.member
        }).then((muteData) => {
            //your code
        });
    }
});

bot.login('TOKEN');