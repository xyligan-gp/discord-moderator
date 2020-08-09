# Discord Moderator

[![Загрузок](https://img.shields.io/npm/dt/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)
[![Стабильная версия](https://img.shields.io/npm/v/discord-moderator?style=for-the-badge)](https://www.npmjs.com/package/discord-moderator)

**Discord Moderator** - библиотека, которая идеально подойдёт для вашего Discord бота написаного на [discord.js](https://discord.js.org)

## Установка

```js
npm install discord-moderator
```

## Примеры

### Запуск модуля

```js
const Discord = require('discord.js'); //npm install discord.js
const ms = require('ms'); //npm install ms
const bot = new Discord.Client();

//Для запуска модуля нужен конструктор Moderator
const { Moderator } = require('discord-moderator');

//Запуск модуля с настройками.
const moderator = new Moderator(bot, {
    storage: "./moderator.json",
    updateCountdownEvery: 5000,
	muteTable: 'muted',
	muteMessageType: 'message',
    muteEmbedColor: 'RANDOM'
});

//Теперь у нас есть свойство модератора для доступа по всей структуре бота!
bot.moderator = moderator;

//Запуск бота со всеми установлеными модулями
bot.on('ready', () => {
    console.log('Ready!');
});

//Авторизация Вашего бота в discord.js
bot.login('TOKEN');
```
После запуска Вашего бота, начнётся автоматическая проверка всех не завершённых в прошлой сессии случаев. Вы можете передать объект параметров, чтобы настроить случаи. Вот их список:
* **bot**: Ваш discord.js клиент(бот)
* **options.storage**: Путь к JSON-файлу, в который будут записываться все случаи.
* **options.updateCountdownEvery**: Количество секунд(в миллисекундах), для обновления случаев
* **options.muteTable**: Таблица в базе для записи мутов
* **muteMessageType**: Тип сообщения, которое отправляется при размуте пользователя: message - обычное сообщение | embed - Discord Embed сообщение
* **muteEmbedColor**: Цвет для Discord Embed сообщения

### Mute | Tempmute | Unmute

```js
bot.on('message', async message => {
    const prefix = 'your prefix';
	let messageArray = message.content.split(' ');
	let cmd = messageArray[0];
    let args = messageArray.slice(1);
    
    if(cmd === `${prefix}mute`) {
		let reason = args2;
		let user = message.mentions.users.last();
		if(!user) return message.channel.send(`${message.author}, укажите пользователя для мута!`);
        if(!reason) return message.channel.send(`${message.author}, укажите время мута!`);
		moderator.mute(message.guild.members.cache.get(user.id), {
            reason: reason,
			author: message.member,
            channel: message.channel,
            mutedRoleID: 'ID мут-роли'
        }).then((muteData) => {
			if(message.guild.member(user).roles.cache.get('ID мут-роли')) return message.channel.send(`${user} уже заглушён!`);
            return message.channel.send(`${user} заглушён! Причина: **${reason}**`);
        }).catch(err => console.log(err))
	}
});
```
* **options.reason**: Причина мута
* **options.author**: Автор мута
* **options.channel**: Канал выдачи мута
* **options.mutedRoleID**: ID мут-роли для выдачи
```js
bot.on('message', async message => {
    const prefix = 'your prefix';
	let messageArray = message.content.split(' ');
	let cmd = messageArray[0];
    let args = messageArray.slice(1);
    
    if(cmd === `${prefix}tempmute`) {
		let user = message.mentions.users.last();
		let time = args[1];
		let reason = args.slice(2);
		if(!user) return message.channel.send(`${message.author}, укажите пользователя для мута!`);
        if(!time) return message.channel.send(`${message.author}, укажите время мута!`);
		if(reason == undefined) return message.channel.send(`${message.author}, укажите причину мута!`);
		moderator.mute(message.guild.members.cache.get(user.id), {
            time: ms(time),
			reason: reason.join(' '),
            author: message.member,
            channel: message.channel,
            mutedRoleID: 'ID мут-роли'
        }).then((muteData) => {
            if(message.guild.member(user).roles.cache.get('ID мут-роли')) return message.channel.send(`${user} уже заглушён!`);
            return message.channel.send(`${user} заглушён на ${time}! Причина: **${reason.join(' ')}**`);
        }).catch(err => console.log(err))
    }
});
```
* **options.time**: Время выдачи мута
* **options.reason**: Причина мута
* **options.author**: Автор мута
* **options.channel**: Канал выдачи мута
* **options.mutedRoleID**: ID мут-роли для выдачи
```js
bot.on('message', async message => {
    const prefix = 'your prefix';
	let messageArray = message.content.split(' ');
	let cmd = messageArray[0];
    let args = messageArray.slice(1);
  
    if(cmd === `${prefix}unmute`) {
		let user = message.mentions.users.last();
		if(!user) return message.channel.send(`${message.author}, укажите пользователя для размута!`);
		moderator.unmute(message.guild.members.cache.get(user.id), {
            author: message.member,
            channel: message.channel,
            mutedRoleID: '698639775846105208'
        }).then((muteData) => {
			if(!message.guild.member(user).roles.cache.get('698639775846105208')) return message.channel.send(`${user} уже разглушён!`);
            return message.channel.send(`${user} разглушён!`);
        }).catch(err => console.log(err))
	}
});
```
* **options.author**: Автор мута
* **options.channel**: Канал выдачи мута
* **options.mutedRoleID**: ID мут-роли для выдачи

### Mute Detect(фикс обхода мута)
```js
bot.on('guildMemberAdd', member => {
	moderator.guildMemberAdd((member), {
		mutedRoleID: '698639775846105208'
	});
});
```
* **options.mutedRoleID**: ID мут-роли для выдачи

# Обновления | Лог обновлений

* **1.0.0**: Релиз модуля.
* **1.0.1**: Фикс некоторых багов и ошибок.
* **1.0.2**: Полностью обновлена система мута, переписана структура модуля.

# Необходимая информация | Контакты

* **Discord создателя модуля**: ♡ xүℓ[ι]gαη4εg ♡#9457
* **Discord-сервер поддержки модуля**: [Клик](https://discord.gg/2uuvDCT)