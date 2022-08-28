import Enmap from "enmap";
import { Client, GuildMember } from "discord.js";

import { MuteManager } from "./managers/MuteManager";
import { WarnManager } from "./managers/WarnManager";
import { FetchManager } from "./managers/FetchManager";
import { UtilsManager } from "./managers/UtilsManager";

import { DefaultObject, PunishOptions } from "./ModeratorData";
import { ModeratorGuildData } from "./ModeratorDatabase";

import { ModeratorEmitter } from "./ModeratorEmitter";

import { ClearType, Events, MuteType, PunishmentType } from "./ModeratorEnums";

import { ModeratorOptions } from "./ModeratorOptions";

export declare class Moderator extends ModeratorEmitter {
    constructor(client: Client, options?: ModeratorOptions);

    private client: Client;

    public database: Enmap<string, ModeratorGuildData>;
    
    public author: string;
    public website: string;
    public version: string;

    public ready: boolean;
    public readyTimestamp: number;
    public options: ModeratorOptions;

    public mutes: MuteManager;
    public warns: WarnManager;
    public fetcher: FetchManager;
    public utils: UtilsManager;

    /**
     * Method for kicking Discord guild users
     * 
     * @param member Discord Guild Member
     * @param reason Kick Reason
     * 
     * @returns Returns the state of the action or an object with an error
     */
    public kick(member: GuildMember, reason?: string): Promise<DefaultObject>;

    /**
     * Method for banning Discord guild users
     * 
     * @param member Discord Guild Member
     * @param reason Ban Reason
     * 
     * @returns Returns the state of the action or an object with an error
     */
    public ban(member: GuildMember, reason?: string): Promise<DefaultObject>;

    /**
     * Method for removing bans from Discord guild users
     * 
     * @param guildID Discord Guild ID
     * @param memberID Discord Guild Member ID
     * 
     * @returns Returns the state of the action or an object with an error
     */
    public unban(guildID: string, memberID: string): Promise<DefaultObject>;

    /**
     * Method for punishing Discord guild users
     * 
     * @param type Punihment Type
     * @param member Discord Guild Member
     * @param options Punish Options
     * 
     * @returns Returns the state of the action or an object with an error
     */
    public punish(type: PunishmentType, member: GuildMember, options: PunishOptions): Promise<DefaultObject>;

    /**
     * Method for module initialization
     * 
     * @param options Moderator Options
     */
    private init(options?: ModeratorOptions): void;

    /**
     * Method for initializing the module database
     */
    private initDatabase(): void;

    /**
     * Method for initializing all module managers
     */
    private initManagers(): void;
}

export { ClearType, Events, MuteType, PunishmentType }