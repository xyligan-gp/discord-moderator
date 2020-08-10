const { Client, Collection } = require('discord.js');
const bot = new Client();

const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'));

const Settings = {
  token: "Токен бота", // https://discord.com/developers/applications
  prefix: "/" // Можете поставить свой
}

bot.once('ready', () => {
  console.log(`Вошёл от имени ${bot.user.tag}`); 
});

// Коллекции
bot.commands = new Collection();

for(const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.on('message', async(message) => {
  if(message.author.bot || !message.guild) return;
  if(!message.content.startsWith(Settings.prefix)) return;
  
  const args = message.content.slice(Settings.prefix.length).trim().split(' ');
  const cmd = args.shift().toLowerCase();
  
  if(!bot.commands.has(cmd)) return;
  
  const command = bot.commands.get(cmd);
  
  try {
    command.run(message, args);
  }catch(e) { console.log(e) }
});

bot.login(Settings.token);
