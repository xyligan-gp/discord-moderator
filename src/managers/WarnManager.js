const base = require('quick.db');
const { Client, GuildMember, TextChannel, Guild } = require('discord.js');
const ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js');
const ModeratorError = require('discord-moderator/src/ModeratorError.js');
const { Warn } = require('discord-moderator/structures/Moderator.js');
const PunishmentManager = require('discord-moderator/src/managers/PunishmentManager.js');
const Emitter = require('discord-moderator/src/Emitter.js');

class WarnManager extends Emitter {
    /**
     * @param {Client} client Discord Client
     * @param {ModeratorOptions} options Moderator Options
    */
    constructor(client, options) {
        super();
        
        if(!client) return new ModeratorError(ModeratorErrors.requireClient);

        this.client = client;
        this.options = options;
        this.punishments = new PunishmentManager(client, options);

        /**
         * Manager Methods
         * @type {Array<String>}
        */
        this.methods = ['add', 'get', 'getAll', 'remove', 'clearGuild', 'clearAll'];

        /**
         * Manager Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;
    }

    /**
     * Method for adding warns to user
     * @param {GuildMember} member Guild Member
     * @param {TextChannel} channel Guild Channel
     * @param {String} reason Warning Reason
     * @param {String} authorID Warn Author ID
     * @param {String} muteRoleID Mute Role ID
     * @returns {Promise<{ status: Boolean, data: WarnData }>} Returns the warning status and warning data
    */
    add(member, channel, reason, authorID, muteRoleID) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnManager) return reject(new ModeratorError(ModeratorErrors.warnManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));
            if(!authorID) return reject(new ModeratorError(ModeratorError.parameterNotFound.replace('{parameter}', 'authorID')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorError.parameterNotFound.replace('{parameter}', 'muteRoleID')));

            const warnsData = base.fetch(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

            Warn.guildID = member.guild.id;
            Warn.userID = member.id;
            Warn.channelID = channel.id;
            Warn.nowTime = new Date().getTime();
            Warn.warnReason = reason;
            Warn.warnBy = authorID;

            if(!warnsData || warnsData == null) {
                Warn.warnNumber = 1;

                base.set(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`, [Warn]);

                this.emit('addWarn', Warn);
                return resolve({ status: true, data: Warn });
            }else{
                Warn.warnNumber = warnsData.length + 1;
                base.push(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`, Warn);

                this.emit('addWarn', Warn);
                resolve({ status: true, data: Warn });

                if(Warn.warnNumber < this.options.warnConfig.maxWarns) return;
                return this.punishments.punish(member, channel, muteRoleID, authorID);
            }
        })
    }

    /**
     * Method for getting warning information
     * @param {GuildMember} member Guild Member
     * @param {Number} index Warn Index
     * @returns {Promise<WarnData>} Returns information about the warning
    */
    get(member, index) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnManager) return reject(new ModeratorError(ModeratorErrors.warnManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!index) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'index')));

            const userData = base.fetch(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);
            if(!userData) return reject(new ModeratorError(ModeratorErrors.warnManager.get.notData.replace('{userID}', member.id)));

            const searchWarn = userData.find(warn => warn.warnNumber === index);
            if(!searchWarn) return reject(new ModeratorError(ModeratorErrors.warnManager.get.invalidWarn.replace('{ID}', index).replace('{userID}', member.id)));

            return resolve(searchWarn);
        })
    }

    /**
     * Method for getting all user warnings
     * @param {GuildMember} member Guild Member
     * @returns {Promise<{ status: Boolean, warns: Number, data: Array<WarnData> }>} Returns an array with all user warnings
    */
    getAll(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnManager) return reject(new ModeratorError(ModeratorErrors.warnManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const userData = base.fetch(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

            if(!userData || userData == null) {
                Warn.guildID = member.guild.id;
                Warn.userID = member.id;
                Warn.channelID = null,
                Warn.nowTime = null,
                Warn.warnNumber = null,
                Warn.warnReason = null,
                Warn.warnBy = null

                return resolve({ status: true, warns: 0, data: [Warn] });
            }else{
                var warns = [];

                for(let i = 0; i < userData.length; i++) {
                    await warns.push({
                        guildID: userData[i].guildID,
                        userID: userData[i].userID,
                        channelID: userData[i].channelID,
                        nowTime: userData[i].nowTime,
                        warnNumber: userData[i].warnNumber,
                        warnReason: userData[i].warnReason,
                        warnBy: userData[i].warnBy
                    });
                }

                return resolve({ status: true, warns: warns.length, data: warns })
            }
        })
    }

    /**
     * Method for removing warnings from a user
     * @param {GuildMember} member Guild Member
     * @returns {Promise<{ status: Boolean, warns: Number, data: Array<WarnData> }>} Returns the status of deleting warnings, their number and information.
    */
    remove(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnManager) return reject(new ModeratorError(ModeratorErrors.warnManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const warnsData = base.fetch(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

            if(!warnsData || warnsData == null) return resolve({ status: false, warns: 0, data: [] });

            if(warnsData.length < 2) {
                base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                this.emit('removeWarn', { guildID: member.guild.id, userID: member.id, warns: 0, data: [] });
                return resolve({ status: true, warns: 0, data: [] });
            }else{
                const newWarns = warnsData.filter(data => data.warnNumber != warnsData.length);
                base.set(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`, newWarns);

                this.emit('removeWarn', { guildID: member.guild.id, userID: member.id, warns: newWarns.length, data: newWarns });
                return resolve({ status: true, warns: newWarns.length, data: newWarns });
            }
        })
    }

    /**
     * Method for removing warnings for a specific server
     * @param {Guild} guild Discord Guild
     * @returns {Promise<Boolean>} Removing Status
    */
    clearGuild(guild) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnManager) return reject(new ModeratorError(ModeratorErrors.warnManagerDisabled));

            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));

            const guildData = base.fetch(`${this.options.warnConfig.tableName}.${guild.id}`);
            if(!guildData || guildData === null) return resolve(false);

            base.delete(`${this.options.warnConfig.tableName}.${guild.id}`);

            return resolve(true);
        })
    }

    /**
     * Method for removing all warns from the database
     * @returns {Promise<Boolean>} Removing Status
    */
    clearAll() {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnManager) return reject(new ModeratorError(ModeratorErrors.warnManagerDisabled));

            const warnsData = base.fetch(this.options.warnConfig.tableName);
            if(!warnsData || warnsData == null) return resolve(false);

            base.delete(this.options.warnConfig.tableName);

            return resolve(true);
        })
    }
}

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

/**
 * Moderator Warn Data
 * @typedef WarnData
 * @property {String} guildID Discord Guild ID
 * @property {String} userID Guild Member ID
 * @property {String} channelID Guild Channel ID
 * @property {Number} nowTime Current time
 * @property {Number} warnNumber Warn Number
 * @property {String} warnReason Warn Reason
 * @property {String} warnBy Warn Author ID
 * @type {Object}
*/

module.exports = WarnManager;