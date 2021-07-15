const base = require('quick.db');
const { Client, GuildMember, TextChannel } = require('discord.js');
const ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js');
const ModeratorError = require('discord-moderator/src/ModeratorError.js');
const { Mute } = require('discord-moderator/structures/Moderator.js');
const Emitter = require('discord-moderator/src/Emitter');
const MuteManager = require('discord-moderator/src/managers/MuteManager.js');
const UtilsManager = require('discord-moderator/src/managers/UtilsManager.js');

class PunishmentManager extends Emitter {
    /**
     * @param {Client} client Discord Client
     * @param {ModeratorOptions} options Moderator Options
    */
    constructor(client, options) {
        super();

        if(!client) return new ModeratorError(ModeratorErrors.requireClient);

        this.client = client;
        this.options = options;
        this.utils = new UtilsManager(client, options);
        this.mutes = new MuteManager(client, options);

        /**
         * Manager Methods
         * @type {Array<String>}
        */
        this.methods = ['kick', 'ban', 'punish'];

        /**
         * Manager Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;
    }

    /**
     * Method for kicking users
     * @param {GuildMember} member Guild Member
     * @param {String} reason Kicking Reason
     * @param {String} authorID Kick Author ID
     * @returns {Promise<{ status: Boolean, data: KickData }>} Returns kick status, reason and more
    */
    kick(member, reason, authorID) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));
            if(!authorID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'authorID')));

            if(!this.utils.checkClientPermissions(['KICK_MEMBERS'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            const guild = this.client.guilds.cache.get(member.guild.id);
            const memberRolePosition = member.roles.highest.position;
            const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(memberRolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));
            
            guild.members.cache.get(member.id).kick(reason).catch(err => { return });

            this.emit('kick', { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID });
            return resolve({ status: true, data: { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID } });
        })
    }

    /**
     * Method for banning users
     * @param {GuildMember} member Guild Member
     * @param {String} reason Banning Reason
     * @param {String} authorID Ban Author ID
     * @returns {Promise<{ status: Boolean, data: BanData }>} Returns ban status, reason and more
    */
    ban(member, reason, authorID) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));
            if(!authorID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'authorID')));

            if(!this.utils.checkClientPermissions(['BAN_MEMBERS'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            const guild = this.client.guilds.cache.get(member.guild.id);
            const memberRolePosition = member.roles.highest.position;
            const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(memberRolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            guild.members.cache.get(member.id).ban({ reason: reason, days: 7 }).catch(err => { return });

            this.emit('ban', { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID });
            return resolve({ status: true, data: { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID } });
        })
    }

    /**
     * Method for punishment users
     * @param {GuildMember} member Guild Member
     * @param {TextChannel} channel Guild Channel
     * @param {String} muteRoleID Mute Role ID
     * @param {String} authorID Author ID
     * @returns {Promise<{ status: Boolean, data: PunishData }>} Returns the status of the punishment, its type, reason, and more
    */
    punish(member, channel, muteRoleID, authorID) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            if(!this.utils.checkClientPermissions(['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            switch(this.options.warnConfig.punishment) {
                case 'tempmute': {
                    Mute.userID = member.id;
                    Mute.channelID = channel.id;
                    Mute.guildID = member.guild.id;
                    Mute.muteReason = 'Exceeded the maximum number of warnings';
                    Mute.muteRoleID = muteRoleID;
                    Mute.muteTime = this.options.warnConfig.muteTime;
                    Mute.nowTime = new Date().getTime();

                    const guild = this.client.guilds.cache.get(member.guild.id);
                    const muteRolePosition = guild.roles.cache.get(muteRoleID).position;
                    const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

                    if(muteRolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

                    await this.mutes.temp(member, channel, muteRoleID, this.options.warnConfig.muteTime, 'Exceeded the maximum number of warnings');
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' } });
                }

                case 'mute': {
                    Mute.userID = member.id;
                    Mute.channelID = channel.id;
                    Mute.guildID = member.guild.id;
                    Mute.muteReason = 'Exceeded the maximum number of warnings';
                    Mute.muteRoleID = muteRoleID;
                    Mute.muteTime = null;
                    Mute.nowTime = new Date().getTime();

                    const guild = this.client.guilds.cache.get(member.guild.id);
                    const muteRolePosition = guild.roles.cache.get(muteRoleID).position;
                    const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

                    if(muteRolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

                    await this.mutes.add(member, channel, muteRoleID, 'Exceeded the maximum number of warnings');
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' } });
                }

                case 'kick': {
                    const guild = this.client.guilds.cache.get(member.guild.id);
                    const memberRolePosition = member.roles.highest.position;
                    const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

                    if(memberRolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

                    await this.kick(member, 'Exceeded the maximum number of warnings', authorID);
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' }  });
                }

                case 'ban': {
                    const guild = this.client.guilds.cache.get(member.guild.id);
                    const memberRolePosition = member.roles.highest.position;
                    const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

                    if(memberRolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

                    await this.ban(member, 'Exceeded the maximum number of warnings', authorID);
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' }  });
                }
            }
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
 * Moderator Kick Data
 * @typedef KickData
 * @property {String} userID Guild Member ID
 * @property {String} guildID Discord Guild ID
 * @property {String} reason Kick Reason
 * @property {String} authorID Kick Author ID
 * @type {Object}
*/

/**
 * Moderator Ban Data
 * @typedef BanData
 * @property {String} userID Guild Member ID
 * @property {String} guildID Discord Guild ID
 * @property {String} reason Baning Reason
 * @property {String} authorID Ban Author ID
 * @type {Object}
*/

/**
 * Moderator Punish Data
 * @typedef PunishData
 * @property {String} punishType Member Punish Type
 * @property {String} userID Guild Member ID
 * @property {String} reason Member Punish Reason
 * @type {Object}
*/

module.exports = PunishmentManager;