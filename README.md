<div align="center">
	<h1>Welcome to the 'discord-moderator' page!</h1>
	<br />
	<p>
		<a href="https://dm.js.org"><img src="https://i.imgur.com/E1EgICl.gif" width="546" alt="DM Main Image" /></a>
	</p>
	<br/>
	<p>
		<a href="https://discord.gg/zzbkvCcu2r"><img src="https://img.shields.io/discord/827221018879328298?color=5865F2&logo=discord&logoColor=white" alt="Support Server" /></a>
		<a href="https://www.npmjs.com/package/discord-moderator"><img src="https://img.shields.io/npm/dt/discord-moderator.png?maxAge=3600" alt="NPM downloads" /></a>
		<a href="https://www.npmjs.com/package/discord-player-music"><img src="https://img.shields.io/npm/v/discord-moderator.png?maxAge=3600" alt="NPM page" /></a>
	</p>
</div>

## About

**Discord Moderator is a powerful [Node.js](https://nodejs.org) moderation module for your Discord.js bot that based on Promises and has a lot of features.**

* 👍 Simple & easy to use
* 😄 Beginner friendly
* 🔑 TypeScript Support
* 💿 Minimum load
* 📂 Multiple servers
* ⚙️ 100% Promise-based

## Installation

**Node.js 16.9.0 or newer is required.**

```sh-session
$ npm install discord-moderator
$ yarn add discord-moderator
$ pnpm add discord-moderator
```

## Example Usage

```js
const { Client, GatewayIntentBits } = require("discord.js");
const { Moderator } = require("discord-moderator");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers
	]
});

client.moderator = new Moderator(client);

client.on('ready', async () => {
  	return console.log('Client is ready!');
})

client.moderator.on('ready', async () => {
	return console.log('Moderator is ready!');
})

client.login('YOUR_CLIENT_TOKEN_HERE');
```

## Links

* NPM: [Open](https://www.npmjs.com/package/discord-moderator)
* GitHub: [Open](https://github.com/xyligan-gp/discord-moderator)
* Documentation: [Open](https://dm.js.org)

* Module Developer: [xyligan](https://github.com/xyligan-gp)
* Developer Discord: [♡ xүℓ[ι]gαη4εg ♡#9457](https://discord.com/users/533347075463577640)
* Support Server: [Join xyligan development](https://discord.gg/zzbkvCcu2r)

<center><h1>♥ Thanks for using Discord Moderator ♥</h1></center>