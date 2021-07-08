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
     * @param {Object} options Moderator Options
     * @param {Boolean} options.muteManager MuteManager Status
     * @param {Boolean} options.warnManager WarnManager Status
     * @param {Object} options.muteConfig MuteManager Configuration
     * @param {String} options.muteConfig.tableName Table Name For MuteManager
     * @param {Number} options.muteConfig.checkCountdown Mutes Check Interval
     * @param {Object} options.warnConfig WarnManager Configuration
     * @param {String} options.warnConfig.tableName Table Name For WarnManager
     * @param {Number} options.warnConfig.maxWarns Maximum number of warns for punishment
     * @param {String} options.warnConfig.punishment User punishment type
     * @param {String} options.warnConfig.muteTime Mute time when reaching the warnings limit
    */
    constructor(client, options) {
        super();
        
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
     * @returns {Promise<{ status: Boolean, data: Object }>} Returns the warning status and warning data
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
     * @returns {Object} Returns information about the warning
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
     * @returns {Promise<{ status: Boolean, warns: Number, data: Array<Object> }>} Returns an array with all user warnings
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
     * @returns {Promise<{ status: Boolean, warns: Number, data: Array<Object> }>} Returns the status of deleting warnings, their number and information.
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
     * @returns {Boolean} Removing Status
    */
    clearGuild(guild) {
        if(!this.options.warnManager) return new ModeratorError(ModeratorErrors.warnManagerDisabled);

        const guildData = base.fetch(`${this.options.warnConfig.tableName}.${guild.id}`);
        if(!guildData || guildData === null) return false;

        base.delete(`${this.options.warnConfig.tableName}.${guild.id}`);

        return true;
    }

    /**
     * Method for removing all warns from the database
     * @returns {Boolean} Removing Status
    */
    clearAll() {
        if(!this.options.warnManager) return new ModeratorError(ModeratorErrors.warnManagerDisabled);

        const warnsData = base.fetch(this.options.warnConfig.tableName);
        if(!warnsData || warnsData == null) return false;

        base.delete(this.options.warnConfig.tableName);

        return true;
    }
}

module.exports = WarnManager;