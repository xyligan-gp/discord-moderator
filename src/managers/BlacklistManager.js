const { Client, GuildMember, Guild } = require('discord.js');
const { Block } = require('discord-moderator/structures/Moderator.js');
const base = require('quick.db');
const PunishmentManager = require('discord-moderator/src/managers/PunishmentManager.js');
const UtilsManager = require('discord-moderator/src/managers/UtilsManager.js');
const ModeratorError = require('discord-moderator/src/ModeratorError.js');
const ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js');

class BlacklistManager {
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
        this.methods = ['add', 'get', 'getAll', 'clearGuild', 'clearAll', 'remove'];

        /**
         * Manager Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;

        this.utils = new UtilsManager(client, options);
        this.punishments = new PunishmentManager(client, options);

        client.on('guildMemberAdd', async member => {
            if(!this.options.blacklistManager) return;

            const blockedUsers = base.fetch(`${this.options.blacklistConfig.tableName}.${member.guild.id}`);
            if(!blockedUsers || blockedUsers === null) return;

            const searchUser = blockedUsers.find(block => block.userID === member.id);
            if(!searchUser) return;

            switch(this.options.blacklistConfig.punishment) {
                case 'kick': {
                    if(!this.utils.checkClientPermissions(['KICK_MEMBERS'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

                    this.punishments.kick(member, 'Discovered on the Blacklist by Moderator!', this.client.user.id);

                    break;
                }

                case 'ban': {
                    if(!this.utils.checkClientPermissions(['BAN_MEMBERS'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

                    this.punishments.ban(member, 'Discovered on the Blacklist by Moderator!', this.client.user.id);

                    break;
                }
            }
        })
    }

    /**
     * Method for blocking a user on the server
     * @param {Guild} guild Discord Guild
     * @param {GuildMember | String} member Guild Member of User ID
     * @param {String} reason Blocking Reason
     * @param {String} authorID Block Author ID
     * @returns {Promise<{ status: Boolean, data: BlockData }>} Returns the user blocking status and information about it
    */
    add(guild, member, reason, authorID) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.blacklistManager) return reject(new ModeratorError(ModeratorErrors.blacklistManagerDisabled));

            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));
            if(!authorID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'authorID')));

            const guildBlocks = base.fetch(`${this.options.blacklistConfig.tableName}.${guild.id}`);

            switch(typeof member) {
                case 'object': {
                    const guildMember = this.utils.fetchMember(guild, member);

                    Block.blockNumber = guildBlocks ? guildBlocks.length + 1 : 1;
                    Block.blockReason = reason;
                    Block.blockedBy = authorID;
                    Block.guildID = guild.id;
                    Block.userID = guildMember.data.id;
                    Block.nowTime = Date.now();

                    break;
                }

                case 'string': {
                    const guildMember = this.utils.fetchMember(guild, member);

                    switch(typeof guildMember.data) {
                        case 'object': {
                            Block.blockNumber = guildBlocks ? guildBlocks.length + 1 : 1;
                            Block.blockReason = reason;
                            Block.blockedBy = authorID;
                            Block.guildID = guild.id;
                            Block.userID = guildMember.data.id;
                            Block.nowDate = Date.now();

                            break;
                        }

                        case 'string': {
                            Block.blockNumber = guildBlocks ? guildBlocks.length + 1 : 1;
                            Block.blockReason = reason;
                            Block.blockedBy = authorID;
                            Block.guildID = guild.id;
                            Block.userID = guildMember.data;
                            Block.nowDate = Date.now();

                            break;
                        }
                    }

                    break;
                }
            }
            
            if(!guildBlocks || !guildBlocks.length) {
                base.set(`${this.options.blacklistConfig.tableName}.${guild.id}`, [Block]);

                return resolve({ status: true, data: Block });
            }else{
                const searchUser = guildBlocks.find(block => block.userID === Block.userID);
                if(searchUser) return reject(new ModeratorError(ModeratorErrors.blacklistManager.add.userBlocked.replace('{userID}', Block.userID).replace('{guildID}', guild.id)));

                base.push(`${this.options.blacklistConfig.tableName}.${guild.id}`, Block);

                return resolve({ status: true, data: Block });
            }
        })
    }

    /**
     * Method for getting the status of a user blocking and information about it
     * @param {Guild} guild Discord Guild
     * @param {GuildMember | String} member Guild Member or User ID
     * @returns {Promise<{ status: Boolean, data: BlockData }>} Returns the user block status and information about it
    */
    get(guild, member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.blacklistManager) return reject(new ModeratorError(ModeratorErrors.blacklistManagerDisabled));

            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const guildBlocks = base.fetch(`${this.options.blacklistConfig.tableName}.${guild.id}`);

            switch(typeof member) {
                case 'object': {
                    const guildMember = this.utils.fetchMember(guild, member);
                    const searchBlock = guildBlocks.find(block => block.userID === guildMember.data.id);

                    if(!searchBlock) return resolve({ status: false, data: null });

                    return resolve({ status: true, data: searchBlock });

                    break;
                }

                case 'string': {
                    const guildMember = this.utils.fetchMember(guild, member);

                    switch(typeof guildMember.data) {
                        case 'object': {
                            const searchBlock = guildBlocks.find(block => block.userID === guildMember.data.id);

                            if(!searchBlock) return resolve({ status: false, data: null });

                            return resolve({ status: true, data: searchBlock });

                            break;
                        }

                        case 'string': {
                            const searchBlock = guildBlocks.find(block => block.userID === guildMember.data);

                            if(!searchBlock) return resolve({ status: false, data: null });

                            return resolve({ status: true, data: searchBlock });

                            break;
                        }
                    }

                    break;
                }
            }
        })
    }

    /**
     * Method for getting all server blocks
     * @param {Guild} guild Discord Guild
     * @returns {Promise<{ status: Boolean, data: Array<BlockData> }>} Returns information about server blocks
    */
    getAll(guild) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.blacklistManager) return reject(new ModeratorError(ModeratorErrors.blacklistManagerDisabled));

            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));

            const guildBlocks = base.fetch(`${this.options.blacklistConfig.tableName}.${guild.id}`);
            if(!guildBlocks || guildBlocks === null) return resolve({ status: false, data: null });

            return resolve({ status: true, data: guildBlocks });
        })
    }

    /**
     * Method for removing blocks from a specific server
     * @param {Guild} guild Discord Guild
     * @returns {Promise<Boolean>} Removing Status
    */
    clearGuild(guild) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.blacklistManager) return reject(new ModeratorError(ModeratorErrors.blacklistManagerDisabled));
            
            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));

            const guildBlocks = base.fetch(`${this.options.blacklistConfig.tableName}.${guild.id}`);

            if(!guildBlocks || guildBlocks === null) return resolve(false);

            base.delete(`${this.options.blacklistConfig.tableName}.${guild.id}`);

            return resolve(true);
        })
    }

    /**
     * Method for removing all blocks from the database
     * @returns {Promise<Boolean>} Removing Status
    */
    clearAll() {
        return new Promise(async (resolve, reject) => {
            if(!this.options.blacklistManager) return reject(new ModeratorError(ModeratorErrors.blacklistManagerDisabled));
            
            const clientBlocks = base.fetch(this.options.blacklistConfig.tableName);
            if(!clientBlocks || clientBlocks === null) return resolve(false);

            base.delete(this.options.blacklistConfig.tableName);

            return resolve(true);
        })
    }

    /**
     * Method for removing a block to a user
     * @param {Guild} guild Discord Guild
     * @param {GuildMember | String} member Guild Mem ber or User ID
     * @returns {Promise<{ status: Boolean, searchUser: Boolean, data: BlockData | null }>} Returns the user unlock status and information about it
    */
    remove(guild, member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.blacklistManager) return reject(new ModeratorError(ModeratorErrors.blacklistManagerDisabled));

            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const guildBlocks = base.fetch(`${this.options.blacklistConfig.tableName}.${guild.id}`);
            if(!guildBlocks || !guildBlocks.length) return resolve({ status: false, searchUser: false, data: null });

            switch(typeof member) {
                case 'object': {
                    const guildMember = this.utils.fetchMember(guild, member);

                    const searchBlock = guildBlocks.find(block => block.userID === guildMember.data.id);
                    if(!searchBlock) return reject(new ModeratorError(ModeratorErrors.blacklistManager.remove.userNotBlocked.replace('{userID}', guildMember.data.id).replace('{guildID}', guild.id)));

                    const data = guildBlocks.filter(block => block.userID != guildMember.data.id);
                    base.set(`${this.options.blacklistConfig.tableName}.${guild.id}`, data);

                    return resolve({ status: true, searchUser: true, data: searchBlock });

                    break;
                }

                case 'string': {
                    const guildMember = this.utils.fetchMember(guild, member);

                    switch(typeof guildMember.data) {
                        case 'object': {
                            const searchBlock = guildBlocks.find(block => block.userID === guildMember.data.id);
                            if(!searchBlock) return reject(new ModeratorError(ModeratorErrors.blacklistManager.remove.userNotBlocked.replace('{userID}', guildMember.data.id).replace('{guildID}', guild.id)));

                            const data = guildBlocks.filter(block => block.userID != guildMember.data.id);
                            base.set(`${this.options.blacklistConfig.tableName}.${guild.id}`, data);

                            return resolve({ status: true, searchUser: true, data: searchBlock });

                            break;
                        }

                        case 'string': {
                            const searchBlock = guildBlocks.find(block => block.userID === guildMember.data);
                            if(!searchBlock) return reject(new ModeratorError(ModeratorErrors.blacklistManager.remove.userNotBlocked.replace('{userID}', guildMember.data).replace('{guildID}', guild.id)));

                            const data = guildBlocks.filter(block => block.userID != guildMember.data);
                            base.set(`${this.options.blacklistConfig.tableName}.${guild.id}`, data);

                            return resolve({ status: true, searchUser: true, data: searchBlock });

                            break;
                        }
                    }

                    break;
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
 * Moderator Block Data
 * @typedef BlockData
 * @property {String} guildID Discord Guild ID
 * @property {String} userID Guild Member ID
 * @property {Number} nowTime Blocking Time
 * @property {Number} blockNumber Guild Block Index
 * @property {String} blockReason Blocking Reason
 * @property {String} blockedBy Block Author ID
 * @type {Object}
*/

module.exports = BlacklistManager;