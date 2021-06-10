# Discord Moderator

[![Downloads](https://img.shields.io/npm/dt/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)
[![Stable Build](https://img.shields.io/npm/v/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)

**Discord Moderator** - A simple module for adding moderation to Discord bot.

## Install

**Please note: Node.js 14.0.0 or newer is required.<br>
All types in brackets mean the type of what the method or event returns.**

```JS
npm install discord-moderator@latest
```

## Starting

```JS
const { Client } = require('discord.js');

const client = new Client();
const Moderator = require('discord-moderator');

const moderator = new Moderator(client, {
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
})

client.on('ready', () => {
    console.log('Bot started!');
})

client.login('YOUR_BOT_TOKEN_HERE'); //https://discord.com/developers/
```

### Module Constructor

```JS
const moderator = new Moderator(client, {
  muteSystem: true, // Mute System Status
  warnSystem: true, // Warn System Status

  muteConfig: {
    tableName: 'mutes', // Table Name For Mute System
    checkCountdown: 5000 // Mutes Check Interval
  },

  warnConfig: {
    tableName: 'warns', // Table Name For Warn System
    maxWarns: 3, // Maximum number of warns for punishment
    punishment: 'tempmute', // User punishment type
    muteTime: '12h' // Mute time when reaching the warnings limit
  }
})
```

* **options.muteSystem**: Property responsible for the status of the muting system.
* **options.warnSystem**: Property responsible for the status of the warning system.

* **options.muteConfig.tableName**: Property responsible for the name of the table for the mute system.
* **options.muteConfig.checkCountdown**: Property responsible for the checking interval of all mutes.

* **options.warnConfig.tableName**: Property responsible for the name of the table for the warn system.
* **options.warnConfig.maxWarns** : Property responsible for the maximum number of warnings.
* **options.warnConfig.punishment**: Property responsible for the method of punishing the user. Available: `tempmute`, `mute`, `kick`, `ban`.
* **options.warnConfig.muteTime**: Property responsible for the mute time for the `tempmute` punishment method.

### Module Methods

* `kick()` - Method for kicking users
```js
/**
 * @param {GuildMember} member Discord GuildMember
 * @param {string} reason Kick Reason
 * @param {string} authorID Kick Author ID
 * @returns {Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>} Kick Object
*/
moderator.kick(member, reason, authorID);
```

* `ban()` - Method for banning users
```js
/**
 * @param {GuildMember} member Discord GuildMember
 * @param {string} reason Ban Reason
 * @param {string} authorID Ban Author ID
 * @returns {Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>} Ban Object
*/
moderator.ban(member, reason, authorID);
```

* `addWarn()` - Method for adding warns to user
```JS
/**
 * @param {GuildMember} member Discord GuildMember
 * @param {Channel} channel Discord Channel
 * @param {string} reason Warn Reason
 * @param {string} authorID Warn Author ID
 * @param {string} muteRoleID Mute Role ID
 * @returns {Promise<{ status: boolean, data: Warn }>} Warn Object
*/
moderator.addWarn(member, channel, reason, authorID, muteRoleID);
```

* `getWarns()` - Method for getting user warnings
```JS
/**
 * @param {GuildMember} member Discord GuildMember
 * @returns {Promise<{ status: boolean, warns: number, data: Array<Warn> }>} User Warns Object
*/
moderator.getWarns(member);
```

* `removeWarn()` - Method for removing warnings from a user
```JS
/**
 * @param {GuildMember} member Discord GuildMember
 * @returns {Promise<{ status: boolean, warns: number, data: Array<Warn> }>} User Warns Object
*/
moderator.removeWarn(member);
```

* `mute()` - Method for issuing a mute to a user
```JS
/**
 * @param {GuildMember} member Discord GuildMember
 * @param {Channel} channel Discord Channel
 * @param {string} muteRoleID Mute Role ID
 * @param {string} muteReason Mute reason
 * @returns {Promise<{ status: boolean, data: Mute }>} Mute Object
*/
moderator.mute(member, channel, muteRoleID, muteReason);
```

* `tempmute()` - Method for issuing a tempmute to a user
```JS
/**
 * @param {GuildMember} member Discord GuildMember
 * @param {Channel} channel Discord Channel
 * @param {string} muteRoleID Mute Role ID
 * @param {string} muteTime Mute Time
 * @param {string} muteReason Mute reason
 * @returns {Promise<{ status: boolean, data: Mute }>} Mute Object
*/
moderator.tempmute(member, channel, muteRoleID, muteTime, muteReason);
```

* `unmute()` - Method for removing the mute to the user
```JS
/**
 * @param {GuildMember} member Discord GuildMember
 * @returns {Promise<{ status: boolean }>} Unmute Status
*/
moderator.unmute(member);
```

* `clearMutes()` - Method for removing all mutes from the database
```JS
/**
 * @returns {boolean} Clearing Status
*/
moderator.clearMutes();
```

* `clearWarns()` - Method for removing all warns from the database
```JS
/**
 * @returns {boolean} Clearing Status
*/
moderator.clearWarns();
```

### Module Events

* `kick` - Emits when the user is kicked from the server
```JS
moderator.on('kick', data => {
  console.log(data);
})
```

* `ban` - Emits when a user is banned from the server
```js
moderator.on('ban', data => {
  console.log(data);
})
```

* `addWarn` - Emits when a warning is given to the user
```js
moderator.on('addWarn', data => {
  console.log(data);
})
```

* `removeWarn` - Emits when warnings are taken from the user
```js
moderator.on('removeWarn', data => {
  console.log(data);
})
```

* `addMute` - Emits when the user is given a mute
```js
moderator.on('addMute', data => {
  console.log(data);
})
```

* `removeMute` - Emits when the user has removed a mute
```js
moderator.on('removeMute', data => {
  console.log(data);
})
```

* `muteEnded` - Emits when the user's temporary mute ends
```js
moderator.on('muteEnded', data => {
  console.log(data);
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
* ***Version 1.1.1***
  * Updating the warning system
  * Modifying the constructor of a module's options
  * Added check for all constructor options
  * Fix module typings
  * Fix minor bugs
  * Added methods: `kick()` & `ban()`
  * Added events: `kick`, `ban`, `addWarn`, `removeWarn`, `addMute`, `removeMute`
* ***Version 1.1.2***
  * Code optimization
  * Fix methods: `kick()` & `ban()`
* ***Version 1.1.3*** 
  * Fix package.json

# Useful Links

* [npm](https://www.npmjs.com/package/discord-moderator)
* [GitHub](https://github.com/xyligan-gp/discord-moderator)
* [Examples](https://github.com/xyligan-gp/discord-moderator/blob/main/example/)
* [Support Server](https://discord.gg/Bbq9v2bWzx)

If you found a bug, please send it in Discord to ♡ xүℓ[ι]gαη4εg ♡#9457.<br>
If you have any questions or need help, join the [Support Server](https://discord.gg/Bbq9v2bWzx).<br>
Module Created by [xyligan](https://www.npmjs.com/~xyligan).

<h1>Thanks for using Discord Moderator ♥</h1>