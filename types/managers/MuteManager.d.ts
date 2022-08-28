import { Role } from "discord.js";

import { Moderator } from "../Moderator";

import { GuildMute } from "../ModeratorDatabase";
import { CreationMuteOptions, DefaultObject } from "../ModeratorData";

export declare class MuteManager {
    constructor(moderator: Moderator);

    private moderator: Moderator;

    /**
     * Method for setting the server role mute
     * 
     * @param guildID Discord Guild ID
     * @param roleID Discord Guild Mute Role ID
     * 
     * @returns Returns the state of action execution
     */
    public setRole(guildID: string, id: string): Promise<DefaultObject>;

    /**
     * A method to get a server role mute
     * 
     * @param guildID Discord Guild ID
     * 
     * @returns Discord Guild Mute Role Object
     */
    public getRole(guildID: string): Promise<Role>;

    /**
     * Method for removing the server role mute
     * 
     * @param guildID Discord Guild ID
     * 
     * @returns Returns the state of action execution
     */
    public deleteRole(guildID: string): Promise<DefaultObject>;

    /**
     * Method for issuing a muth to a Discord Guild user
     * 
     * @param type Mute Type
     * @param options Creation Mute Options
     * 
     * @returns Returns an object with muta data or an object with an error
     */
    public create(type: MuteType, options: CreationMuteOptions): Promise<GuildMute & DefaultObject>;

    /**
     * A method for obtaining data on the user's active mute on the Discord guild
     * 
     * @param guildID Discord Guild ID
     * @param memberID Discord Guild Member ID
     * 
     * @returns Returns the object with the data of the active mute or the null
     */
    public get(guildID: string, memberID: string): Promise<GuildMute>;

    /**
     * A method for obtaining an array of mutes of a specific Discord guild or user from it
     * 
     * @param guildID Discord Guild ID
     * @param memberID Discord Guild Member ID
     * 
     * @returns Returns an array of Discord mutes of a guild or user
     */
    public list(guildID: string, memberID?: string): Promise<Array<GuildMute>>;

    /**
     * A method for removing muths from Discord guild users
     * 
     * @param guildID Discord Guild ID
     * @param memberID Discord Guild Member ID
     * 
     * @returns Returns the state of the action or an object with an error
     */
    public delete(guildID: string, memberID: string): Promise<DefaultObject>;
}