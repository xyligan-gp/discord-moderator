const { Client, GuildMember, Guild } = require('discord.js');
const ms = require('discord-moderator/src/modules/ms.js');

class UtilsManager {
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
        this.client = client;

        this.options = options;

        /**
         * Methods Array
         * @type {Array<String>}
        */
        this.methods = ['checkOptions', 'checkClientPermissions', 'checkMemberPermissions'];

        /**
         * Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;
    }

    /**
     * Method for check Moderator Options
     * @returns {Object} Correct Moderator Options
    */
    checkOptions() {
        if(typeof this.options != 'object') {
            this.options = {
                muteManager: true,
                warnManager: true,

                muteConfig: {
                    tableName: 'mutes',
                    checkCountdown: '10s'
                },

                warnConfig: {
                    tableName: 'warns',
                    maxWarns: 3,
                    punishment: 'ban',
                    muteTime: '1d'
                }
            }
        }else{
            if(typeof this.options.muteManager != 'boolean') this.options.muteManager = true;
            if(typeof this.options.warnManager != 'boolean') this.options.warnManager = true;

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
        }

        return this.options;
    }

    /**
     * Method for checking client permissions on the server
     * @param {Array<String>} permissionsArray Array with permissions to check
     * @param {Guild} guild Discord Guild
     * @returns {Boolean} Boolean value that will indicate the presence/absence of permissions
    */
    checkClientPermissions(permissionsArray, guild) {
        const guildMember = guild.members.cache.get(this.client.user.id);
        return guildMember.roles.highest.permissions.has(permissionsArray);
    }

    /**
     * Method for checking member permissions on the server
     * @param {Array<String>} permissionsArray Array with permissions to check
     * @param {GuildMember} member Guild Member
     * @returns {Boolean} Boolean value that will indicate the presence/absence of permissions
    */
    checkMemberPermissions(permissionsArray, member) {
        const guild = member.guild;
        return guild.members.cache.get(member.id).permissions.has(permissionsArray);
    }
}

module.exports = UtilsManager;