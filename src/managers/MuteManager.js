const base = require('quick.db');
const { Client, GuildMember, TextChannel, Guild } = require('discord.js');
const ms = require('discord-moderator/src/modules/ms.js');
const ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js');
const ModeratorError = require('discord-moderator/src/ModeratorError.js');
const { Mute } = require('discord-moderator/structures/Moderator.js');
const UtilsManager = require('discord-moderator/src/managers/UtilsManager.js');
const Emitter = require('discord-moderator/src/Emitter');

class MuteManager extends Emitter {
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

        /**
         * Manager Methods
         * @type {Array<String>}
        */
        this.methods = ['add', 'temp', 'get', 'getAll', 'remove', 'clearGuild', 'clearAll'];

        /**
         * Manager Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;

        client.on('guildMemberAdd', member => {
            if(!this.options.muteManager) return;

            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

            const mutesData = base.fetch(this.options.muteConfig.tableName);

            if(!mutesData || mutesData === null) return;

            const searchMutes = mutesData.find(data => data.userID === member.id);
            if(!searchMutes) return;

            if(searchMutes.guildID != member.guild.id) return;

            const muteRolePosition = member.guild.roles.cache.get(searchMutes.muteRoleID).position;
            const clientRolePosition = member.guild.members.cache.get(client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return new ModeratorError(ModeratorErrors.MissingAccess);

            member.roles.add(searchMutes.muteRoleID);
        })
    }

    /**
     * Method for issuing a mute to a user
     * @param {GuildMember} member Guild Member
     * @param {TextChannel} channel Guild Channe;
     * @param {String} muteRoleID Mute Role ID
     * @param {String} muteReason Muting Reason
     * @returns {Promise<{ status: Boolean, data: Object }>} Returns the mute status and information about it
    */
    add(member, channel, muteRoleID, muteReason) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteManager) return reject(new ModeratorError(ModeratorErrors.muteManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteRoleID')));
            
            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            Mute.guildID = member.guild.id;
            Mute.userID = member.id;
            Mute.channelID = channel.id;
            Mute.muteRoleID = muteRoleID;
            Mute.muteTime = null;
            Mute.nowTime = new Date().getTime();
            Mute.muteReason = muteReason || null;

            const mutesData = base.fetch(this.options.muteConfig.tableName);
            const muteRolePosition = member.guild.roles.cache.get(muteRoleID).position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            if(!mutesData || mutesData == null) {
                try {
                    await member.roles.add(muteRoleID);

                    await base.set(this.options.muteConfig.tableName, [Mute]);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }else{
                const searchMute = mutesData.find(data => data.userID === member.id);
                if(searchMute) return reject(new ModeratorError(ModeratorErrors.muteManager.add.userAlreadyMuted.replace('{ID}', member.id)));

                try {
                    await member.roles.add(muteRoleID);

                    await base.push(this.options.muteConfig.tableName, Mute);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }
        })
    }

    /**
     * Method for issuing a tempmute to a user
     * @param {GuildMember} member Guild Member
     * @param {TextChannel} channel Guild Channel
     * @param {String} muteRoleID Mute Role ID
     * @param {String} muteTime Muting Time
     * @param {String} muteReason Muting Reason
     * @returns {Promise<{ status: Boolean, data: Object }>} Returns the status of issuing a temporary mute and information about it
    */
    temp(member, channel, muteRoleID, muteTime, muteReason) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteManager) return reject(new ModeratorError(ModeratorErrors.muteManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteRoleID')));
            if(!muteTime) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteTime')));
            
            if(!ms(muteTime)) return reject(new ModeratorError(ModeratorErrors.muteManager.temp.invalidValue));

            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            Mute.guildID = member.guild.id;
            Mute.userID = member.id;
            Mute.channelID = channel.id;
            Mute.muteRoleID = muteRoleID;
            Mute.muteTime = ms(muteTime);
            Mute.nowTime = new Date().getTime();
            Mute.muteReason = muteReason || null;

            const mutesData = base.fetch(this.options.muteConfig.tableName);
            const muteRolePosition = member.guild.roles.cache.get(muteRoleID).position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            if(!mutesData || mutesData == null) {
                try {
                    await member.roles.add(muteRoleID);

                    await base.set(this.options.muteConfig.tableName, [Mute]);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }else{
                const searchMute = mutesData.find(data => data.userID === member.id);
                if(searchMute) return reject(new ModeratorError(ModeratorErrors.mute.userAlreadyMuted.replace('{ID}', member.id)));

                try {
                    await member.roles.add(muteRoleID);

                    await base.push(this.options.muteConfig.tableName, Mute);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }
        })
    }

    /**
     * Method for getting information about a user mute on the server
     * @param {GuildMember} member Guild Member
     * @returns {Promise<{ status: Boolean, searchGuild: Boolean, searchUser: Boolean, data: Object }>} Returns search status and mute information
    */
    get(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteManager) return reject(new ModeratorError(ModeratorErrors.muteManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const mutesData = base.fetch(this.options.muteConfig.tableName);
            if(!mutesData || mutesData == null) return resolve({ status: false, searchGuild: null, searchUser: null, data: null });

            const searchGuild = mutesData.filter(mute => mute.guildID === member.guild.id);
            if(!searchGuild) return resolve({ status: true, searchGuild: false, searchUser: null, data: null });

            const searchMember = searchGuild.filter(mute => mute.userID === member.id);
            if(!searchMember || !searchMember.length) return resolve({ status: true, searchGuild: true, searchUser: false, data: null });

            return resolve({ status: true, searchGuild: true, searchUser: true, data: searchMember[0] });
        })
    }

    /**
     * Method for getting user mutes on all bot servers
     * @param {GuildMember} member Guild Member
     * @returns {Promise<{ status: Boolean, searchUser: Boolean, data: Array<Object> }>} Returns the search status of the user and all his mutes on the bot servers
    */
    getAll(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteManager) return reject(new ModeratorError(ModeratorErrors.muteManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const mutesData = base.fetch(this.options.muteConfig.tableName);
            if(!mutesData || mutesData == null) return resolve({ status: false, searchUser: null, data: null });

            const searchMember = mutesData.filter(mute => mute.userID === member.id);
            if(!searchMember || !searchMember.length) return resolve({ status: true, searchUser: false, data: null });

            return resolve({ status: true, searchUser: true, data: searchMember });
        }) 
    }

    /**
     * Method for removing the mute to the user
     * @param {GuildMember} member Guild Member
     * @returns {Promise<{ status: Boolean }>} Returns the status of removing a mutate from a user
    */
    remove(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteManager) return reject(new ModeratorError(ModeratorErrors.muteManagerDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            const mutesData = base.fetch(this.options.muteConfig.tableName);

            if(!mutesData || mutesData == null) return reject(new ModeratorError(ModeratorErrors.cleanBase.replace('{parameter}', 'Mutes')));

            const searchMute = mutesData.find(data => data.userID === member.id);
            if(!searchMute) return reject(new ModeratorError(ModeratorErrors.muteManager.remove.userAlreadyUnMuted.replace('{ID}', member.id)));

            try {
                const muteRolePosition = member.guild.roles.cache.get(searchMute.muteRoleID).position;
                const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

                if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

                await member.roles.remove(searchMute.muteRoleID).catch(error => { return reject(error) });

                const newBase = mutesData.filter(data => data.userID != member.id);
                await base.set(this.options.muteConfig.tableName, newBase);

                this.emit('removeMute', { userID: member.id, guildID: member.guild.id })
                return resolve({ status: true });
            }catch(error){
                return reject(error);
            }
        })
    }

    /**
     * Method for removing mutes from a specific server
     * @param {Guild} guild Discord Guild
     * @returns {Boolean} Removing Status
    */
    clearGuild(guild) {
        if(!this.options.muteManager) return new ModeratorError(ModeratorErrors.muteManagerDisabled);

        const mutesData = base.fetch(this.options.muteConfig.tableName);
        if(!mutesData || mutesData == null) return false;

        const searchGuild = mutesData.filter(mute => mute.guildID === guild.id);
        if(!searchGuild) return false;

        const newData = mutesData.filter(mute => mute.guildID != guild.id);
        base.set(this.options.muteConfig.tableName, newData);

        return true;
    }

    /**
     * Method for removing all mutes from the database
     * @returns {Boolean} Removing Status
    */
    clearAll() {
        if(!this.options.muteManager) return new ModeratorError(ModeratorErrors.muteManagerDisabled);

        const mutesData = base.fetch(this.options.muteConfig.tableName);
        if(!mutesData || mutesData == null) return false;

        base.delete(this.options.muteConfig.tableName);

        return true;
    }
}

module.exports = MuteManager;