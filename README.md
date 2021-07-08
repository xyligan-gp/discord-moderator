# Discord Moderator

[![Downloads](https://img.shields.io/npm/dt/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)
[![Stable Build](https://img.shields.io/npm/v/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)

**Discord Moderator** - A simple module for adding moderation to Discord bot.

## Installation

**Please note: Node.js 14.0.0 or newer is required.<br>
All types in brackets mean the type of what the method or event returns.**

Install [discord-moderator](https://www.npmjs.com/package/discord-moderator)
```JS
$ npm install discord-moderator
```

Install [quick.db](https://www.npmjs.com/package/quick.db)
```JS
$ npm install quick.db
```

## Features

* Simple & easy to use 👍
* Beginner friendly 😄
* Minimalistic option constructor 🔧
* TypeScript Support 🔑
* Flexible and customizable 🛠️
* 100% Promise-based ⚙️

## [Documentation](https://dm-docs.tk)

## Getting Started

```JS
const Discord = require('discord.js');

const client = new Discord.Client();
const Moderator = require('discord-moderator');
const moderator = new Moderator(client);

client.on('ready', () => {
  console.log('Bot started!');
})

client.login('YOUR_BOT_TOKEN_HERE'); //https://discord.com/developers/
```

## Module Constructor

```JS
const moderator = new Moderator(client, {
  muteManager: true,
  warnManager: true,

  muteConfig: {
    tableName: 'mutes',
    checkCountdown: '10s'
  },

  warnConfig: {
    tableName: 'warns',
    maxWarns: 3,
    punishment: 'kick',
    muteTime: '1d'
  }
});
```

* **options.muteManager**: Property responsible for the status of the muting manager.
* **options.warnManager**: Property responsible for the status of the warning manager.

* **options.muteConfig.tableName**: Property responsible for the name of the table for the mute manager.
* **options.muteConfig.checkCountdown**: Property responsible for the checking interval of all mutes.

* **options.warnConfig.tableName**: Property responsible for the name of the table for the warn manager.
* **options.warnConfig.maxWarns** : Property responsible for the maximum number of warnings.
* **options.warnConfig.punishment**: Property responsible for the method of punishing the user. Available: `tempmute`, `mute`, `kick`, `ban`.
* **options.warnConfig.muteTime**: Property responsible for the mute time for the `tempmute` punishment method.

# Module Events

* `ready` - Emits when the Moderator is initialized
```JS
moderator.on('ready', client => {
  console.log('Discord Moderator ready!');
});
```

* `addMute` - Emits when the user is given a mute
```JS
moderator.on('addMute', data => {
  const guild = client.guilds.cache.get(data.guildID);
  const member = guild.members.cache.get(data.userID);

  return console.log(`User ${member.user.tag} got a mute on server ${guild.name} for ${data.muteReason}!`);
});
```

* `addWarn` - Emits when a warning is given to the user
```JS
moderator.on('addWarn', data => {
  const guild = client.guilds.cache.get(data.guildID);
  const member = guild.members.cache.get(data.userID);

  return console.log(`User ${member.user.tag} got a warn on server ${guild.name} for ${data.warnReason}!`);
});
```

* `ban` - Emits when a user is banned from the server
```JS
moderator.on('ban', data => {
  const guild = client.guilds.cache.get(data.guildID);
  const member = guild.members.cache.get(data.userID);

  return console.log(`User ${member.user.tag} banned on server ${guild.name} for ${data.reason}!`);
});
```

* `kick` - Emits when the user is kicked from the server
```JS
moderator.on('kick', data => {
  const guild = client.guilds.cache.get(data.guildID);
  const member = guild.members.cache.get(data.userID);

  return console.log(`User ${member.user.tag} kicked on server ${guild.name} for ${data.reason}!`);
});
```

* `muteEnded` - Emits when the user's temporary mute ends
```JS
moderator.on('muteEnded', data => {
  const guild = client.guilds.cache.get(data.guildID);
  const member = guild.members.cache.get(data.userID);

  return console.log(`User ${member.user.tag} expired mute on server ${guild.name}!`);
});
```

* `removeMute` - Emits when the user has removed a mute
```JS
moderator.on('removeMute', data => {
  const guild = client.guilds.cache.get(data.guildID);
  const member = guild.members.cache.get(data.userID);

  return console.log(`User ${member.user.tag} unmuted on server ${guild.name}!`);
});
```

* `removeWarn` - Emits when warnings are taken from the user
```JS
moderator.on('removeWarn', data => {
  const guild = client.guilds.cache.get(data.guildID);
  const member = guild.members.cache.get(data.userID);

  return console.log(`User ${member.user.tag} unwarned on server ${guild.name}!`);
});
```

## Bot Example

```JS
const Discord = require('discord.js');
const Moderator = require('discord-moderator');
const client = new Discord.Client();
const prefix = '!';

client.moderator = new Moderator(client);

client.on('ready', () => {
  console.log(`${client.user.tag} ready!`);
});

client.on('message', async message => {
  if(!message.content.startsWith(prefix)) return;

  const messageArray = message.content.split(' ');
  const command = messageArray[0];
  const args = messageArray.slice(1);

  if(command === `${prefix}mute`) {
    if(!client.moderator.utils.checkMemberPermissions(['KICK_MEMBERS'], message.member)) return;

    const member = message.mentions.members.last();
    const roleID = '295193127333241854';
    const reason = args.slice(1).join(' ');

    client.moderator.mutes.add(member, message.channel, roleID, reason);
  }

  if(command === `${prefix}tempmute`) {
    if(!client.moderator.utils.checkMemberPermissions(['KICK_MEMBERS'], message.member)) return;

    const member = message.mentions.members.last();
    const roleID = '295193127333241854';
    const time = '1d';
    const reason = args.slice(1).join(' ');

    client.moderator.mutes.temp(member, message.channel, roleID, time, reason);
  }

  if(command === `${prefix}unmute`) {
    if(!client.moderator.utils.checkMemberPermissions(['KICK_MEMBERS'], message.member)) return;

    const member = message.mentions.members.last();

    client.moderator.mutes.remove(member);
  }
});
```

# Useful Links

* [Documentation](https://dm-docs.tk)
* [npm](https://www.npmjs.com/package/discord-moderator)
* [GitHub](https://github.com/xyligan-gp/discord-moderator)
* [Examples](https://github.com/xyligan-gp/discord-moderator/blob/master/example/)
* [Support Server](https://discord.gg/zzbkvCcu2r)

If you found a bug, please send it in Discord to ♡ xүℓ[ι]gαη4εg ♡#9457.<br>
If you have any questions or need help, join the [Support Server](https://discord.gg/zzbkvCcu2r).<br>
Module Created by [xyligan](https://www.npmjs.com/~xyligan).

<h1>Thanks for using Discord Moderator ♥</h1>