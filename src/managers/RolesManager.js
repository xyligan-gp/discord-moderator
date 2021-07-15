const { Client, Role, Guild, GuildMember, Collection, Permissions } = require('discord.js');
const ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js');
const ModeratorError = require('discord-moderator/src/ModeratorError.js');
const UtilsManager = require('discord-moderator/src/managers/UtilsManager.js');

class RolesManager {
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
        this.methods = ['create', 'add', 'get', 'getAll', 'remove', 'delete'];

        /**
         * Manager Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;

        this.utils = new UtilsManager(client, options);
    }

    /**
     * Method for creating roles on the server
     * @param {Guild} guild Discord Guild
     * @param {RoleOptions} options Role Options
     * @returns {Promise<{ status: Boolean, role: Role }>} Returns the role creation status and information about it
    */
    create(guild, options) {
        return new Promise(async (resolve, reject) => {
            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));
            if(!options.roleName) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'options.roleName')));

            if(!options.roleColor || typeof options.roleColor != 'string') options.roleColor = this.utils.getRandomString(['DEFAULT', 'WHITE', 'AQUA', 'GREEN', 'BLUE', 'YELLOW', 'PURPLE', 'LUMINOUS_VIVID_PINK', 'GOLD', 'ORANGE', 'RED', 'GREY', 'DARKER GREY', 'NAVY', 'DARK_AQUA', 'DARK_GREEN', 'DARK_BLUE', 'DARK_PURPLE', 'DARK_VIVID_PINK', 'DARK_GOLD', 'DARK_ORANGE', 'DARK_RED', 'DARK_GREY', 'LIGHT_GREY', 'DARK_NAVY', 'BLURPLE', 'GREYPLE', 'DARK_BUT_NOT_BLACK', 'NOT_QUITE_BLACK', 'RANDOM']);
            if(options.hoisted === undefined || typeof options.hoisted != 'boolean') options.hoisted = true;
            if(!options.position || typeof options.position != 'number') options.position = this.utils.getRandomNumber(1, guild.roles.cache.size);
            if(options.permissionsArray === undefined) options.permissionsArray = ['ADD_REACTIONS', 'ATTACH_FILES', 'CONNECT', 'CREATE_INSTANT_INVITE', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'SPEAK', 'USE_EXTERNAL_EMOJIS', 'VIEW_CHANNEL'];
            if(options.mentionable === undefined || typeof options.mentionable != 'boolean') options.mentionable = true;

            const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(options.position >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            guild.roles.create({
                data: {
                    name: options.roleName,
                    color: options.roleColor,
                    hoist: options.hoisted,
                    position: options.position,
                    permissions: options.permissionsArray,
                    mentionable: options.mentionable
                }
            }).then(role => {
                return resolve({ status: true, role: role });
            }).catch(err => { return });
        })
    }

    /**
     * Method for adding roles to server users
     * @param {GuildMember} member Guild Member
     * @param {Role | String} role Guild Role or Role Name
     * @returns {Promise<{ status: Boolean, member: GuildMember, role: Role }>} Returns the status of adding a role and other information
    */
    add(member, role) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!role) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'role')));

            if(typeof role != 'string' && typeof role != 'object') return reject(new ModeratorError(ModeratorErrors.rolesManager.add.invalidTypeArg.replace('{parameter}', 'role')));
            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

            const guildRole = await this.get(member.guild, role);
            if(!guildRole.status) return reject(new ModeratorError(ModeratorErrors.rolesManager.add.error));

            if(member.roles.cache.get(guildRole.role.id)) return reject(new ModeratorError(ModeratorErrors.rolesManager.add.hasRole.replace('{userID}', member.id).replace('{roleName}', guildRole.role.name)));

            const rolePosition = guildRole.role.position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(rolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            await member.roles.add(guildRole.role).catch(err => { return });

            return resolve({ status: true, member: member, role: guildRole.role })
        })
    }

    /**
     * Method for getting information about the server role
     * @param {Guild} guild Discord Guild
     * @param {Role | String} role Guild Role or Role Name
     * @returns {Promise<{ status: Boolean, role: Role }>} Returns information about the server role
    */
    get(guild, role) {
        return new Promise(async (resolve, reject) => {
            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));
            if(!role) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'role')));

            if(typeof role != 'string' && typeof role != 'object') return reject(new ModeratorError(ModeratorErrors.rolesManager.get.invalidTypeArg.replace('{parameter}', 'role')));
            
            if(typeof role === 'string') {
                if(role.startsWith('<@&') && role.endsWith('>')) {
                    const roleName = role.replace('<@&', '').replace('>', '');

                    const searchRole = guild.roles.cache.find(roles => roles.name === roleName);
                    if(!searchRole) return resolve({ status: false, role: null });

                    return resolve({ status: true, role: searchRole });
                }else{
                    const searchRole = guild.roles.cache.find(roles => roles.name === role);
                    if(!searchRole) return resolve({ status: false, role: null });

                    return resolve({ status: true, role: searchRole });
                }
            }else{
                return resolve({ status: true, role: role });
            }
        })
    }

    /**
     * Method to get a collection of all server roles
     * @param {Guild} guild Discord Guild
     * @returns {Collection<String, Role>} Returns the collection of server roles
    */
    getAll(guild) {
        return new Promise(async (resolve, reject) => {
            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));

            return resolve(guild.roles.cache);
        })
    }

    /**
     * Method for removing roles from server users
     * @param {GuildMember} member Guild Member
     * @param {Role | String} role Guild Role or Role Name
     * @returns {Promise<{ status: Boolean, member: GuildMember, role: Role }>} Returns the status of removing a role from a user and other information
    */
    remove(member, role) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!role) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'role')));

            if(typeof role != 'string' && typeof role != 'object') return reject(new ModeratorError(ModeratorErrors.rolesManager.remove.invalidTypeArg.replace('{parameter}', 'role')));
            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

            const guildRole = await this.get(member.guild, role);
            if(!guildRole.status) return reject(new ModeratorError(ModeratorErrors.rolesManager.remove.error));

            if(!member.roles.cache.get(guildRole.role.id)) return reject(new ModeratorError(ModeratorErrors.rolesManager.remove.notHasRole.replace('{userID}', member.id).replace('{roleName}', guildRole.role.name)));

            const rolePosition = guildRole.role.position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(rolePosition >= clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            await member.roles.remove(guildRole.role).catch(err => { return });

            return resolve({ status: true, member: member, role: guildRole.role });
        })
    }

    /**
     * Method for removing roles from the server
     * @param {Guild} guild Discord Guild
     * @param {Role | String} role Guild Role of Role Name 
     * @returns {Promise<{ status: Boolean, role: Role }>} Returns the status of removing a role from the server and information about it
    */
    delete(guild, role) {
        return new Promise(async (resolve, reject) => {
            if(!guild) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'guild')));
            if(!role) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'role')));
            
            const guildRole = await this.get(guild, role);
            if(!guildRole.status) return reject(new ModeratorError(ModeratorErrors.rolesManager.delete.error));

            guildRole.role.delete().then(role => {
                return resolve({ status: true, role: role });
            }).catch(err => { return });
        })
    }
}

/**
 * Moderator Create Role Options
 * @typedef RoleOptions
 * @property {String} roleName Role Name
 * @property {'DEFAULT' | 'WHITE' | 'AQUA' | 'GREEN' | 'BLUE' | 'YELLOW' | 'PURPLE' | 'LUMINOUS_VIVID_PINK' | 'GOLD' | 'ORANGE' | 'RED' | 'GREY' | 'DARKER GREY' | 'NAVY' | 'DARK_AQUA' | 'DARK_GREEN' | 'DARK_BLUE' | 'DARK_PURPLE' | 'DARK_VIVID_PINK' | 'DARK_GOLD' | 'DARK_ORANGE' | 'DARK_RED' | 'DARK_GREY' | 'LIGHT_GREY' | 'DARK_NAVY' | 'BLURPLE' | 'GREYPLE' | 'DARK_BUT_NOT_BLACK' | 'NOT_QUITE_BLACK' | 'RANDOM'} roleColor Role Color
 * @property {Boolean} hoisted Role Hoist Status
 * @property {Number} position Role Position
 * @property {Array<Permissions>} permissionsArray Role Permissions
 * @property {Boolean} mentionable Role Mention Status
 * @type {Object}
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

module.exports = RolesManager;