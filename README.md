# Discord Moderator

[![Downloads](https://img.shields.io/npm/dt/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)
[![Stable Build](https://img.shields.io/npm/v/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)

**Discord Moderator** - A simple module for adding moderation to Discord bot.

## Install

**Please note: Node.js 14.0.0 or newer is required.**

```JS
npm install discord-moderator@latest
```

## Starting

```JS
const { Client } = require('discord.js');

const client = new Client();
const Moderator = require('discord-moderator');

const moderator = new Moderator(bot, {
    mutesTableName: 'mutes',
    checkMutesCountdown: 10000,
    warnsTableName: 'warns'
});

client.on('ready', () => {
    console.log('Bot started!');
})

client.login('TOKEN');
```

### Module Constructor

```JS
const moderator = new Moderator(bot, {
    mutesTableName: 'mutes',
    checkMutesCountdown: 10000,
    warnsTableName: 'warns'
});
```

* **options.mutesTableName**: The property that is responsible for the name of the mutes table.
* **options.checkMutesCountdown**: The property that is responsible for the interval for checking the mutes.
* **options.warnsTableName**: The property that is responsible for the name of the warns table.

### Module Methods

* `addWarn()` - Method for adding warns to user
```JS
/**
 * @param {Discord.GuildMember} member Discord GuildMember
 * @param {Discord.Channel} channel Discord Channel
 * @param {String} reason Warn Reason
 * @param {String} authorID Warn Author ID
*/
addWarn(member, channel, reason, authorID);
```

* `getWarns()` - Method for getting user warnings
```JS
/**
 * @param {Discord.GuildMember} member Discord GuildMember
*/
getWarns(member);
```

* `removeWarn()` - Method for removing warnings from a user
```JS
/**
 * @param {Discord.GuildMember} member Discord GuildMember
*/
removeWarn(member);
```

* `mute()` - Method for issuing a mute to a user
```JS
/**
 * @param {Discord.GuildMember} member Discord GuildMember
 * @param {Discord.Channel} channel Discord Channel
 * @param {String} muteRoleID Mute Role ID
 * @param {String} muteReason Mute reason
*/
mute(member, channel, muteRoleID, muteReason);
```

* `tempmute()` - Method for issuing a tempmute to a user
```JS
/**
 * @param {Discord.GuildMember} member Discord GuildMember
 * @param {Discord.Channel} channel Discord Channel
 * @param {String} muteRoleID Mute Role ID
 * @param {String} muteTime Mute Time
 * @param {String} muteReason Mute reason
*/
tempmute(member, channel, muteRoleID, muteTime, muteReason);
```

* `unmute()` - Method for removing the mute to the user
```JS
/**
 * @param {Discord.GuildMember} member Discord GuildMember
*/
unmute(member);
```

* `clearMutes()` - Method for removing all mutes from the database
```JS
/**
 * @returns {boolean} Clearing Status
*/
clearMutes();
```

* `clearWarns()` - Method for removing all warns from the database
```JS
/**
 * @returns {boolean} Clearing Status
*/
clearWarns();
```

### Module Events

* `muteEnded` - Emits when someone adds a mute to the user
```JS
moderator.on('muteEnded', data => {
        bot.channels.cache.get(data.channelID).send(`<@${data.userID}> removed mute!`);
})
```

# Module Changelog

* ***Version 1.0.0***
  * Release module
* ***Version 1.0.1***
  * Fixed some bugs and errors
* ***Version 1.0.2***
  * Completely updated mute system, rewrited module structure
* ***Version 1.0.3***
  * Added warning system
  * Fix bugs and errors
* ***Versions 1.0.4 - 1.0.6***
  * Fix README.md
  * Correcting errors
* ***Version 1.1.0***
  * The structure of the module has been completely rewritten
  * Fix all bugs, errors and problems
  * Added event: `muteEnded`
  * Adding TypeScript support

# Useful Links

* [npm](https://www.npmjs.com/package/discord-moderator)
* [GitHub](https://github.com/xyligan-gp/discord-moderator)
* [Examples](https://github.com/xyligan-gp/discord-moderator/blob/main/example/)
* [Support Server](https://discord.gg/Bbq9v2bWzx)

If you found a bug, please send it in Discord to ♡ xүℓ[ι]gαη4εg ♡#9457.<br>
If you have any questions or need help, join the [Support Server](https://discord.gg/Bbq9v2bWzx).<br>
Module Created by [xyligan](https://www.npmjs.com/~xyligan).

<h1>Thanks for using Discord Moderator ♥</h1>