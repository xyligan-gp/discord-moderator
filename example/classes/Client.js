const { Client, Collection } = require('discord.js');
const Moderator = require('discord-moderator');

const Utils = require('./Utils.js');
const Config = require('../config.json');

module.exports = class ModeratorBot extends Client {
    constructor() {
        super({
            partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER']
        })

        this.commands = new Collection();
        this.aliases = new Collection();
        this.events = new Collection();

        this.config = Config;
        this.moderator = new Moderator(this, {
            muteManager: true,
            warnManager: true,

            muteConfig: {
                tableName: 'mutes',
                checkCountdown: '10s'
            },

            warnConfig: {
                tableName: 'warns',
                maxWarns: 3,
                punishment: 'tempmute',
                muteTime: '1h'
            }
        });
        this.utils = new Utils(this);
    }

    start() {
        this.utils.startClient();
    }
}