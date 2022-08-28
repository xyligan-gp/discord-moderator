import { GuildMember } from "discord.js";
import { Moderator } from "../Moderator";
import { CreationWarnOptions } from "../ModeratorData";
import { GuildWarn } from "../ModeratorDatabase";

export declare class WarnManager {
    constructor(moderator: Moderator);

    private moderator: Moderator;

    /**
     * Method for issuing a warning to a Discord guild user
     * 
     * @param member Discord Guild Member
     * @param options Creation Warn Options
     * 
     * @returns Returns an object with warning data
     */
    public add(member: GuildMember, options: CreationWarnOptions): Promise<GuildWarn>;
}