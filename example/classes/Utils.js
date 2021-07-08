const ModeratorBot = require('./Client.js');
const { readdirSync } = require('fs');

module.exports = class Utils {
    
    /**
     * @param {ModeratorBot} client Discord Client
     */
    constructor(client) {
        this.client = client;
    }

    startClient() {
        const botCommands = readdirSync('./cmds').filter(file => file.endsWith('js'));

        botCommands.map(botCommand => {
            const command = require(`../cmds/${botCommand}`);

            this.client.commands.set(command.name, command);

            if(command.aliases && command.aliases.length) command.aliases.map(alias => this.client.aliases.set(alias, command.name));
        })
        
        const botEvents = readdirSync('./events').filter(file => file.endsWith('js'));

        botEvents.map(botEvent => {
            const event = require(`../events/${botEvent}`);

            this.client.events.set(event.name, event);
            this.client.on(event.name, event.run.bind(null, this.client));
        })

        const moderatorEvents = readdirSync('./events/moderator').filter(file => file.endsWith('js'));

        moderatorEvents.map(moderatorEvent => {
            const event = require(`../events/moderator/${moderatorEvent}`);

            this.client.events.set(event.name, event);
            this.client.moderator.on(event.name, event.run.bind(null, this.client));
        })

        this.client.login(this.client.config.token);
    }
}