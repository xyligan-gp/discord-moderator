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
     * @returns {Promise<{ status: Boolean, data: { userID: String, guildID: String, reason: String, authorID: String } }>} Returns kick status, reason and more
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

            if(memberRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));
            
            guild.members.cache.get(member.id).kick(reason);

            this.emit('kick', { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID });
            return resolve({ status: true, data: { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID } });
        })
    }

    /**
     * Method for banning users
     * @param {GuildMember} member Guild Member
     * @param {String} reason Banning Reason
     * @param {String} authorID Ban Author ID
     * @returns {Promise<{ status: Boolean, data: { userID: String, guildID: String, reason: String, authorID: String } }>} Returns ban status, reason and more
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

            if(memberRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            guild.members.cache.get(member.id).ban({ reason: reason, days: 7 });

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
     * @returns {Promise<{ status: Boolean, data: { punishType: String, userID: String, reason: String } }>} Returns the status of the punishment, its type, reason, and more
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

                    await this.mutes.add(member, channel, muteRoleID, 'Exceeded the maximum number of warnings');
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' } });
                }

                case 'kick': {
                    await this.kick(member, 'Exceeded the maximum number of warnings', authorID);
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' }  });
                }

                case 'ban': {
                    await this.ban(member, 'Exceeded the maximum number of warnings', authorID);
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' }  });
                }
            }
        })
    }
}

module.exports = PunishmentManager;