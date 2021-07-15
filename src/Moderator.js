const { Client } = require('discord.js');
const base = require('quick.db');
const ms = require('discord-moderator/src/modules/ms.js');
const ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js');
const ModeratorError = require('discord-moderator/src/ModeratorError.js');
const UtilsManager = require('discord-moderator/src/managers/UtilsManager.js');
const WarnManager = require('discord-moderator/src/managers/WarnManager.js');
const PunishmentManager = require('discord-moderator/src/managers/PunishmentManager.js');
const MuteManager = require('discord-moderator/src/managers/MuteManager.js');
const RolesManager = require('discord-moderator/src/managers/RolesManager.js');
const BlacklistManager = require('discord-moderator/src/managers/BlacklistManager.js');
const Emitter = require('discord-moderator/src/Emitter');

class Moderator extends Emitter {
    /**
     * @param {Client} client Discord Client
     * @param {ModeratorOptions} options Moderator Options
    */
    constructor(client, options) {
        super();

        if(!client) return new ModeratorError(ModeratorErrors.requireClient);

        this.client = client;

        /**
         * Moderator Utils Manager
         * @type {UtilsManager}
        */
        this.utils = new UtilsManager(client, options);
        const fetchedOptions = this.utils.checkOptions();

        /**
         * Moderator Options
         * @type {ModeratorOptions}
        */
        this.options = fetchedOptions;

        /**
         * Moderator Ready Status
         * @type {Boolean}
        */
        this.ready = false;

        /**
         * Moderator Version
         * @type {String}
        */
        this.version = require('../package.json').version;

        /**
         * Moderator Author
         * @type {String}
        */
        this.author = require('../package.json').author;

        /**
         * Moderator Documentation Link
         * @type {String}
        */
        this.docs = require('../package.json').homepage;

        /**
         * Moderator Warn Manager
         * @type {WarnManager}
        */
        this.warns = new WarnManager(client, this.options);

        /**
         * Moderator Punishments Maganer
         * @type {PunishmentManager}
        */
        this.punishments = new PunishmentManager(client, this.options);

        /**
         * Moderator Mute Manager
         * @type {MuteManager}
        */
        this.mutes = new MuteManager(client, this.options);

        /**
         * Moderator Roles Manager
         * @type {RolesManager}
        */
        this.roles = new RolesManager(client, this.options);

        /**
         * Moderator Blacklist Manager
         * @type {BlacklistManager}
        */
        this.blacklist = new BlacklistManager(client, this.options);

        /**
         * Moderator Managers
         * @type {Array<String>}
        */
        this.managers = ['BlacklistManager', 'MuteManager', 'PunishmentManager', 'RolesManager', 'UtilsManager', 'WarnManager'];

        /**
         * Moderator Managers Count
         * @type {Number}
        */
        this.size = this.managers.length;

        client.on('ready', async () => {
            this.initModerator();
        })

        this.on('ready', client => {
            if(!this.options.muteManager) return;

            setInterval(async () => {
                const mutesData = base.fetch(this.options.muteConfig.tableName);

                if(!mutesData || mutesData == null) return;

                for(var i = 0; i < mutesData.length; i++) {
                    const nowTime = new Date().getTime();
                    const muteNowTime = mutesData[i].nowTime;
                    const muteTime = mutesData[i].muteTime;

                    if(muteTime === null) return;

                    if(nowTime - muteNowTime > muteTime) {
                        const guild = this.client.guilds.cache.get(mutesData[i].guildID);
                        if(!guild) return;

                        const member = guild.members.cache.get(mutesData[i].userID);
                        if(!member) return;

                        if(!member.roles.cache.has(mutesData[i].muteRoleID)) {
                            const newBase = mutesData.filter(obj => obj.nowTime != muteNowTime);
                            base.set(this.options.muteConfig.tableName, newBase);

                            this.emit('muteEnded', mutesData[i]);
                        }else{
                            const muteRolePosition = member.guild.roles.cache.get(mutesData[i].muteRoleID).position;
                            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

                            if(muteRolePosition > clientRolePosition) return new ModeratorError(ModeratorErrors.MissingAccess);

                            await member.roles.remove(mutesData[i].muteRoleID).catch(err => { return });
                        
                            const newBase = mutesData.filter(obj => obj.nowTime != muteNowTime);
                            base.set(this.options.muteConfig.tableName, newBase);

                            this.emit('muteEnded', mutesData[i]);
                        }
                    }
                }
            }, ms(this.options.muteConfig.checkCountdown));
        })
    }

    /**
     * Method for initialization module
     * @returns {void}
     * @private 
    */
    initModerator() {
        this.ready = true;
        this.emit('ready', this.client);
    }
}

/**
 * Emits when the Moderator is initialized
 * @event Moderator#ready
 * @param {Client} callback Callback
*/

/**
 * Emits when the user is kicked from the server
 * @event Moderator#kick
 * @param {Object} callback Callback
 * @param {String} callback.userID User ID
 * @param {String} callback.guildID Guild ID
 * @param {String} callback.reason Kicking Reason
 * @param {String} callback.authorID Kick Author ID
*/

/**
 * Emits when a user is banned from the server
 * @event Moderator#ban
 * @param {Object} callback Callback
 * @param {String} callback.userID User ID
 * @param {String} callback.guildID Guild ID
 * @param {String} callback.reason Banning Reason
 * @param {String} callback.authorID Ban Author ID
*/

/**
 * Emits when a warning is given to the user
 * @event Moderator#addWarn
 * @param {Object} callback Callback
 * @param {String} callback.guildID Guild ID
 * @param {String} callback.userID User ID
 * @param {String} callback.channelID Channel ID
 * @param {Number} callback.nowTime Current Time
 * @param {Number} callback.warnNumber Warn Index
 * @param {String} callback.warnReason Warning Reason
 * @param {String} callback.warnBy Warn By User
*/

/**
 * Emits when warnings are taken from the user
 * @event Moderator#removeWarn
 * @param {Object} callback Callback
 * @param {String} callback.guildID Guild ID
 * @param {String} callback.userID User ID
 * @param {Number} callback.warns User Warns Count
 * @param {Array<Object>} callback.data User Warns Array
*/

/**
 * Emits when the user is given a mute
 * @event Moderator#addMute
 * @param {Object} callback Callback
 * @param {String} callback.guildID Guild ID
 * @param {String} callback.userID User ID
 * @param {String} callback.channelID Channel ID
 * @param {String} callback.muteRoleID Mute Role ID
 * @param {Number} callback.muteTime Muting Time
 * @param {Number} callback.nowTime Current Time
 * @param {String} callback.muteReason Muting Reason
*/

/**
 * Emits when the user has removed a mute
 * @event Moderator#removeMute
 * @param {Object} callback Callback
 * @param {String} callback.userID User ID
 * @param {String} callback.guildID Guild ID
*/

/**
 * Emits when the user's temporary mute ends
 * @event Moderator#muteEnded
 * @param {Object} callback Callback
 * @param {String} callback.guildID Guild ID
 * @param {String} callback.userID User ID
 * @param {String} callback.channelID Channel ID
 * @param {String} callback.muteRoleID Mute Role ID
 * @param {Number} callback.muteTime Muting Time
 * @param {Number} callback.nowTime Current Time
 * @param {String} callback.muteReason Muting Reason
*/

/**
 * Moderator Options Object
 * @typedef ModeratorOptions
 * @property {Boolean} muteManager MuteManager Status
 * @property {Boolean} warnManager WarnManager Status
 * @property {Boolean} blacklistManager BlacklistManager Status
 * @property {Object} muteConfig MuteManager Configuration
 * @property {String} muteConfig.tableName Table Name For MuteManager
 * @property {String} muteConfig.checkCountdown Mutes Check Interval
 * @property {Object} warnConfig WarnManager Configuration
 * @property {String} warnConfig.tableName Table Name For WarnManager
 * @property {Number} warnConfig.maxWarns Maximum number of warns for punishment
 * @property {String} warnConfig.punishment User punishment type
 * @property {String} warnConfig.muteTime Mute time when reaching the warnings limit
 * @property {Object} blacklistConfig BlacklistManager Status
 * @property {String} blacklistConfig.tableName Table Name For BlacklistManager
 * @property {String} blacklistConfig.punishment User punishment type
 * @type {Object}
*/

module.exports = Moderator;