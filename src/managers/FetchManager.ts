import { Guild, GuildMember, Role } from "discord.js";

import { Moderator } from "../Moderator";

/**
 * Class that controls Moderation Fetch System
 * 
 * @class
 * @classdesc Moderator Fetch Manager Class
 */
export class FetchManager {
    private moderator: Moderator;

    /**
     * @constructor
     *
     * @param {Moderator} moderator Moderator Class
     */
    constructor(moderator: Moderator) {
        /**
         * Moderator Class
         * 
         * @type {Moderator}
         * @private
         */
        this.moderator = moderator;
    }

    /**
     * Method for obtaining a Discord Guild
     * 
     * @param {string} id Discord Guild ID
     * 
     * @returns {Promise<Guild>} Discord Guild Object
     */
    public guild(id: string): Promise<Guild> {
        return new Promise(async (res, rej) => {
            let fetchedGuild: Guild = null;

            const cachedGuild = this.moderator.client.guilds.cache.get(id);

            if(!cachedGuild) {
                try {
                    fetchedGuild = await this.moderator.client.guilds.fetch(id);
                } catch(error) {
                    return res(null);
                }

                return res(fetchedGuild);
            }else return res(cachedGuild);
        })
    }

    /**
     * Method for obtaining a Discord Guild role
     * 
     * @param {string} guildID Discord Guild ID
     * @param {string} id Discord Guild Role ID
     * 
     * @returns {Promise<Role>} Discord Guild Role Object
     */
    public role(guildID: string, id: string): Promise<Role> {
        return new Promise(async (res, rej) => {
            const guild = await this.guild(guildID);
            if(!guild) return res(null);

            let fetchedRole: Role = null;

            const cachedRole = guild.roles.cache.get(id);

            if(!cachedRole) {
                try {
                    fetchedRole = await guild.roles.fetch(id);
                } catch(error) {
                    return res(null);
                }

                return res(fetchedRole);
            }else return res(cachedRole);
        })
    }
    
    /**
     * Method for getting a Discord Guild user
     * 
     * @param {string} guildID Discord Guild ID
     * @param {string} id Discord Guild Member ID
     * 
     * @returns {Promise<GuildMember>} Discord Guild Member Object
     */
    public member(guildID: string, id: string): Promise<GuildMember> {
        return new Promise(async (res, rej) => {
            const guild = await this.guild(guildID);
            if(!guild) return res(null);

            let fetchedMember: GuildMember = null;

            const cachedMember = guild.members.cache.get(id);

            if(!cachedMember) {
                try {
                    fetchedMember = await guild.members.fetch(id);
                } catch(error) {
                    return res(null);
                }

                return res(fetchedMember);
            }else return res(cachedMember);
        })
    }
}