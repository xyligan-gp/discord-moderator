<div align="center">
  <br />
  <p>
    <a href="https://dm-docs.tk"><img src="https://dm-docs.tk/static/dm.png" width="546" alt="discord-moderator" /></a>
  </p>
  <br/>
  <p>
    <a href="https://discord.gg/zzbkvCcu2r"><img src="https://img.shields.io/discord/827221018879328298?color=5865F2&logo=discord&logoColor=white" alt="Support server" /></a>
    <a href="https://www.npmjs.com/package/discord-moderator"><img src="https://img.shields.io/npm/v/discord-moderator.png?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/discord-moderator"><img src="https://img.shields.io/npm/dt/discord-moderator.png?maxAge=3600" alt="NPM downloads" /></a>
  </p>
</div>

## Welcome
<b>Welcome! This 'discord-moderator' module!</b><br>
<b>This is a simple module for adding moderation to Discord bot.</b>

## Installation

**Please note: Node.js 14.0.0 or newer is required.<br>
All types in brackets mean the type of what the method or event returns.**

Install [discord-moderator](https://www.npmjs.com/package/discord-moderator)
```JS
$ npm install discord-moderator
```

## Features

* Simple & easy to use 👍
* Beginner friendly 😄
* Minimalistic option constructor 🔧
* TypeScript Support 🔑
* Flexible and customizable 🛠️
* 100% Promise-based ⚙️

## Module Managers
- 'BlacklistManager' - <b>Manager that enables Blacklist System.</b>
- 'MuteManager' - <b>Manager that enables Mute System.</b>
- 'PunishmentManager' - <b>Manager that enables Blacklist System.</b>
- 'RolesManager' - <b>Manager that enables Roles System.</b>
- 'UtilsManager' - <b>Manager that includes some utils for other managers.</b>
- 'WarnManager' - <b>Manager that enables Warn System.</b>

## Module Constructor Options
- 'options.muteManager' - <b>Property responsible for the status of the muting manager.</b>
- 'options.warnManager' - <b>Property responsible for the status of the warning manager.</b>
- 'options.blacklistManager' - <b>Property responsible for the status of the blacklist manager.</b>

- 'options.muteConfig.tableName' - <b>Property responsible for the name of the table for the mute manager.</b>
- 'options.muteConfig.checkCountdown' - <b>Property responsible for the checking interval of all mutes.</b>

- 'options.warnConfig.tableName' - <b>Property responsible for the name of the table for the warn manager.</b>
- 'options.warnConfig.maxWarns' - <b>Property responsible for the maximum number of warnings.</b>
- 'options.warnConfig.punishment' - <b>Property responsible for the method of punishing the user. Available: `tempmute`, `mute`, `kick`, `ban`.</b>
- 'options.warnConfig.muteTime' - <b>Property responsible for the mute time for the `tempmute` punishment method.</b>

- 'options.blacklistConfig.tableName' - <b>Property responsible for the name of the table for the blacklist manager.</b>
- 'options.blacklistConfig.punishment' - <b>Property responsible for the method of punishing the user. Available: `kick`, `ban`.</b>

## Quick Initialization Example

```JS
const Discord = require('discord.js');

const client = new Discord.Client();
const Moderator = require('discord-moderator');
const moderator = new Moderator(client);

client.on('ready', () => {
  console.log('Bot started!');
})

client.login('YOUR_BOT_TOKEN_HERE');
```

## Examples
<b><a href="https://github.com/xyligan-gp/discord-moderator/tree/master/example">Click here to see JavaScript examples.</a></b>

# Useful Links

* Module Developer: [xyligan](https://www.npmjs.com/~xyligan)
* Developer Discord: [♡ xүℓ[ι]gαη4εg ♡#9457](https://discord.com/users/533347075463577640)
* Documentation: [Click](https://dm-docs.tk)
* NPM: [Click](https://www.npmjs.com/package/discord-moderator)
* GitHub: [Click](https://github.com/xyligan-gp/discord-moderator)
* Examples: [Click](https://github.com/xyligan-gp/discord-moderator/blob/master/example/)
* Support Server - [Click](https://discord.gg/zzbkvCcu2r)

<h1>Thanks for using Discord Moderator ♥</h1>