const { Client, Role, Guild, GuildMember, Collection } = require('discord.js');
const ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js');
const ModeratorError = require('discord-moderator/src/ModeratorError.js');
const UtilsManager = require('discord-moderator/src/managers/UtilsManager.js');

class RolesManager {
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
         * Manager Methods
         * @type {Array<String>}
        */
         this.methods = ['add', 'get', 'getAll', 'remove'];

        /**
         * Manager Methods Count
         * @type {Number}
        */
        this.size = this.methods.length;

        this.utils = new UtilsManager(client, options);
    }

    /**
     * Method for adding roles to server users
     * @param {GuildMember} member Guild Member
     * @param {Role | String} role Guild Role or Role Name
     * @returns {void}
    */
    add(member, role) {
        return new Promise(async (resolve, reject) => {
            if(typeof role != 'string' && typeof role != 'object') return reject(new ModeratorError(ModeratorErrors.rolesManager.add.invalidTypeArg.replace('{parameter}', 'role')));
            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

            const guildRole = await this.get(member.guild, role);
            if(!guildRole.status) return reject(new ModeratorError(ModeratorErrors.rolesManager.add.error));

            if(member.roles.cache.get(guildRole.role.id)) return reject(new ModeratorError(ModeratorErrors.rolesManager.add.hasRole.replace('{userID}', member.id).replace('{roleName}', guildRole.role.name)));

            const rolePosition = guildRole.role.position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(rolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            await member.roles.add(guildRole.role).catch(err => { return });
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
            return resolve(guild.roles.cache);
        })
    }

    /**
     * Method for removing roles from server users
     * @param {GuildMember} member Guild Member
     * @param {Role | String} role Guild Role
     * @returns {void}
    */
    remove(member, role) {
        return new Promise(async (resolve, reject) => {
            if(typeof role != 'string' && typeof role != 'object') return reject(new ModeratorError(ModeratorErrors.rolesManager.remove.invalidTypeArg.replace('{parameter}', 'role')));
            if(!this.utils.checkClientPermissions(['MANAGE_ROLES'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

            const guildRole = await this.get(member.guild, role);
            if(!guildRole.status) return reject(new ModeratorError(ModeratorErrors.rolesManager.remove.error));

            if(!member.roles.cache.get(guildRole.role.id)) return reject(new ModeratorError(ModeratorErrors.rolesManager.remove.notHasRole.replace('{userID}', member.id).replace('{roleName}', guildRole.role.name)));

            const rolePosition = guildRole.role.position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(rolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            await member.roles.remove(guildRole.role).catch(err => { return });
        })
    }
}

module.exports = RolesManager;