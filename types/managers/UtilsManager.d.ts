import { Moderator } from "../Moderator";

import ModeratorOptions from "../ModeratorOptions";

export declare class UtilsManager {
    constructor(moderator: Moderator);

    private moderator: Moderator;

    /**
     * Method for validating all module settings
     * 
     * @param options Moderator Options
     * 
     * @returns Full module settings object
     */
    public fetchOptions(options?: ModeratorOptions): ModeratorOptions;
    
    /**
     * Method for initializing a guild object in the module database
     * 
     * @param guildID Discord Guild ID
     */
    private fetchGuild(guildID: string): void;

    /**
     * A method for checking the specified Discord client intents
     */
    private fetchIntents(): void;

    /**
     * Method for generating a random ID
     * 
     * @param len Length of generated ID
     * 
     * @returns Returns the generated id
     */
    public generateID(len?: number): string;

    /**
     * Method for obtaining a Discord guild user's punishment type
     * 
     * @param warns Number of user warnings
     * 
     * @returns Returns the user's punishment type
     */
    public fetchPunishment(warns: number): PunishmentType;
}