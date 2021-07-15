const { Client, GuildMember, Guild, Permissions, User } = require('discord.js');
const ms = require('discord-moderator/src/modules/ms.js');

class UtilsManager {
    /**
     * @param {Client} client Discord Client
     * @param {ModeratorOptions} options Moderator Options
    */
    constructor(client, options) {
        if(!client) return new ModeratorError(ModeratorErrors.requireClient);
        
        this.client = client;
        this.options = options;

        /**
         * Manager Methods
         * @type {Array<String>}
        */
        this.methods = ['checkOptions', 'checkClientPermissions', 'checkMemberPermissions', 'getRandomNumber', 'getRandomString', 'fetchMember'];

        /**
         * Manager Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;
    }

    /**
     * Method for check Moderator Options
     * @returns {ModeratorOptions} Correct Moderator Options
    */
    checkOptions() {
        if(typeof this.options != 'object') {
            this.options = {
                muteManager: true,
                warnManager: true,
                blacklistManager: true,

                muteConfig: {
                    tableName: 'mutes',
                    checkCountdown: '10s'
                },

                warnConfig: {
                    tableName: 'warns',
                    maxWarns: 3,
                    punishment: 'ban',
                    muteTime: '1d'
                },

                blacklistConfig: {
                    tableName: 'blacklist',
                    punishment: 'kick'
                }
            }
        }else{
            if(typeof this.options.muteManager != 'boolean') this.options.muteManager = true;
            if(typeof this.options.warnManager != 'boolean') this.options.warnManager = true;
            if(typeof this.options.blacklistManager != 'boolean') this.options.blacklistManager = true;

            if(!this.options.muteConfig) {
                this.options.muteConfig = {
                    tableName: 'mutes',
                    checkCountdown: '10s'
                }
            }else{
                if(typeof this.options.muteConfig.tableName != 'string') this.options.muteConfig.tableName = 'mutes';
                if(typeof this.options.muteConfig.checkCountdown != 'string' && !ms(this.options.muteConfig.checkCountdown)) this.options.muteConfig.checkCountdown = '10s';
            }

            if(!this.options.warnConfig) {
                this.options.warnConfig = {
                    tableName: 'warns',
                    maxWarns: 3,
                    punishment: 'ban',
                    muteTime: '1d'
                }
            }else{
                if(typeof this.options.warnConfig.tableName != 'string') this.options.warnConfig.tableName = 'warns';
                if(typeof this.options.warnConfig.maxWarns != 'number') this.options.warnConfig.maxWarns = 3;
                if(typeof this.options.warnConfig.punishment != 'string') this.options.warnConfig.punishment = 'ban';
                if(typeof this.options.warnConfig.muteTime != 'string' && !ms(this.options.muteConfig.checkCountdown)) this.options.warnConfig.muteTime = '1d';
            }

            if(!this.options.blacklistConfig) {
                this.options.blacklistConfig = {
                    tableName: 'blacklist',
                    punishment: 'kick'
                }
            }else{
                if(typeof this.options.blacklistConfig.tableName != 'string') this.options.blacklistConfig.tableName = 'blacklist';
                if(typeof this.options.blacklistConfig.punishment != 'string') this.options.blacklistConfig.punishment = 'kick';
            }
        }

        return this.options;
    }

    /**
     * Method for checking client permissions on the server
     * @param {Array<Permissions>} permissionsArray Array with permissions to check
     * @param {Guild} guild Discord Guild
     * @returns {Boolean} Boolean value that will indicate the presence/absence of permissions
    */
    checkClientPermissions(permissionsArray, guild) {
        const guildMember = guild.members.cache.get(this.client.user.id);
        return guildMember.permissions.has(permissionsArray);
    }

    /**
     * Method for checking member permissions on the server
     * @param {Array<Permissions>} permissionsArray Array with permissions to check
     * @param {GuildMember} member Guild Member
     * @returns {Boolean} Boolean value that will indicate the presence/absence of permissions
    */
    checkMemberPermissions(permissionsArray, member) {
        const guild = member.guild;
        return guild.members.cache.get(member.id).permissions.has(permissionsArray);
    }

    /**
     * Method for getting a random number in between
     * @param {Number} min Minimum value
     * @param {Number} max Maximum value
     * @returns {Number} Returns a random number in a given range
    */
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Method for getting a random string
     * @param {Array<String>} stringsArray Strings Array
     * @returns {String} Returns a random string
    */
    getRandomString(stringsArray) {
        return stringsArray[Math.floor(Math.random() * stringsArray.length)];
    }

    /**
     * Method for checking user existence
     * @param {Guild} guild Discord Guild
     * @param {GuildMember | String} member Guild Member or User ID
     * @returns {{ status: Boolean, data: User | String }} Returns the user verification status and information about him
    */
    fetchMember(guild, member) {
        switch(typeof member) {
            case 'object': {
                return { status: true, data: member.user };

                break;
            }

            case 'string': {
                const guildMember = guild.members.cache.get(member);
                if(guildMember) return { status: true, data: guildMember.user };

                const clientMember = this.client.users.cache.get(member);
                if(clientMember) return { status: true, data: clientMember };

                return { status: true, data: member };

                break;
            }
        }
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

module.exports = UtilsManager;