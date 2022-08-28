import { Guild, GuildMember, Role } from "discord.js";

import { Moderator } from "../Moderator";

export declare class FetchManager {
    constructor(moderator: Moderator);

    private moderator: Moderator;

    /**
     * Method for obtaining a Discord Guild
     * 
     * @param id Discord Guild ID
     * 
     * @returns Discord Guild Object
     */
    public guild(id: string): Promise<Guild>;

    /**
     * Method for obtaining a Discord Guild role
     * 
     * @param guildID Discord Guild ID
     * @param id Discord Guild Role ID
     * 
     * @returns Discord Guild Role Object
     */
    public role(guildID: string, id: string): Promise<Role>;

    /**
     * Method for getting a Discord Guild user
     * 
     * @param guildID Discord Guild ID
     * @param id Discord Guild Member ID
     * 
     * @returns Discord Guild Member Object
     */
    public member(guildID: string, id: string): Promise<GuildMember>;
}