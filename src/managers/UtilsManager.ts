import { GatewayIntentBits, IntentsBitField } from "discord.js";

import { Moderator } from "../Moderator";

import { PunishmentType } from "../ModeratorEnums";

import { ModeratorOptions } from "../../types/ModeratorOptions";

/**
 * Class that controls Moderation Utils System
 * 
 * @class
 * @classdesc Moderator Utils Manager Class
 */
export class UtilsManager {
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
     * Method for validating all module settings
     * 
     * @param {ModeratorOptions} options Moderator Options
     * 
     * @returns {ModeratorOptions} Full module settings object
     */
    public fetchOptions(options?: ModeratorOptions): ModeratorOptions {
        if(!options) {
            options = {
                database: {
                    path: "./",
                    name: "moderator"
                },

                managers: {
                    mute: {
                        isMutingOnJoin: true,
                        isEnabled: true,
                        interval: 5000
                    },

                    warn: {
                        isEnabled: true,
                        limits: [3, 6],

                        punishment: {
                            isEnabled: true,
                            time: null,
                            type: [PunishmentType.KICK, PunishmentType.BAN]
                        }
                    }
                }
            }
        }else{
            if(!options?.database) {
                options.database = {
                    path: "./",
                    name: "moderator"
                }
            }else{
                if(!options?.database?.path || typeof options?.database?.path != "string") options.database.path = "./";
                if(!options?.database?.name || typeof options?.database?.name != "string") options.database.name = "moderator";
            }
            
            if(!options?.managers) {
                options.managers = {
                    mute: {
                        isMutingOnJoin: true,
                        isEnabled: true,
                        interval: 5000
                    },

                    warn: {
                        isEnabled: true,
                        limits: [3, 6],

                        punishment: {
                            isEnabled: true,
                            time: null,
                            type: [PunishmentType.KICK, PunishmentType.BAN]
                        }
                    }
                }
            }else{
                if(!options?.managers?.mute) {
                    options.managers.mute = {
                        isMutingOnJoin: true,
                        isEnabled: true,
                        interval: 5000
                    }
                }else{
                    if(typeof options?.managers?.mute?.isMutingOnJoin != "boolean") options.managers.mute.isMutingOnJoin = true;
                    if(typeof options?.managers?.mute?.isEnabled != "boolean") options.managers.mute.isEnabled = true;
                    if(typeof options?.managers?.mute?.interval != "number") options.managers.mute.interval = 5000;
                }

                if(!options?.managers?.warn) {
                    options.managers.warn = {
                        isEnabled: true,
                        limits: [3, 6],

                        punishment: {
                            isEnabled: true,
                            time: null,
                            type: [PunishmentType.KICK, PunishmentType.BAN]
                        }
                    }
                }else{
                    if(typeof options?.managers?.warn?.isEnabled != "boolean") options.managers.warn.isEnabled = true;
                    if(typeof options?.managers?.warn?.limits != "number" && typeof options?.managers?.warn?.limits != "object") options.managers.warn.limits = [3, 6];
                    
                    if(!options?.managers?.warn?.punishment) {
                        options.managers.warn.punishment = {
                            isEnabled: true,
                            time: null,
                            type: [PunishmentType.KICK, PunishmentType.BAN]
                        }
                    }else{
                        if(typeof options?.managers?.warn?.punishment?.isEnabled != "boolean") options.managers.warn.punishment.isEnabled = true;
                        if(typeof options?.managers?.warn?.punishment?.type != "string" && typeof options?.managers?.warn?.punishment?.type != "object" && options.managers.warn.punishment.isEnabled) options.managers.warn.punishment.type = [PunishmentType.KICK, PunishmentType.BAN];
                        if(typeof options?.managers?.warn?.punishment?.time != "number" && options?.managers?.warn?.punishment?.type?.includes(PunishmentType.TEMPMUTE) && options.managers.warn.punishment.isEnabled) options.managers.warn.punishment.time = 86400; 
                    }
                }
            }
        }

        return options;
    }

    /**
     * Method for initializing a guild object in the module database
     * 
     * @param {string} guildID Discord Guild ID
     * 
     * @private
     */
    public fetchGuild(guildID: string): void {
        const guildData = this.moderator.database.get(guildID);
        
        if(!guildData) {
            this.moderator.database.set(guildID, {
                guildID: guildID,
                muteRole: null,
                
                mutes: [],
                warns: []
            })
        }else{
            const dataObject = new Object(guildData);

            if(!dataObject.hasOwnProperty("guildID")) guildData.guildID = guildID;
            if(!dataObject.hasOwnProperty("muteRole")) guildData.muteRole = null;
            if(!dataObject.hasOwnProperty("mutes")) guildData.mutes = [];
            if(!dataObject.hasOwnProperty("warns")) guildData.warns = [];

            this.moderator.database.set(guildID, guildData);
        }
    }

    /**
     * A method for checking the specified Discord client intents
     * 
     * @private
     */
    public fetchIntents(): void {
        const defaultIntents: GatewayIntentBits[] = [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers
        ]
        
        const clientIntents = new IntentsBitField(this.moderator.client.options.intents);

        for(const intent of defaultIntents) {
            if(!clientIntents.has(intent)) throw new Error(`Missing required client intent: '${GatewayIntentBits[intent]}'!`);
        }
    }

    /**
     * Method for obtaining a Discord guild user's punishment type
     * 
     * @param {number} warns Number of user warnings
     * 
     * @returns {PunishmentType} Returns the user's punishment type
     */
    public fetchPunishment(warns: number): PunishmentType {
        let punishment: PunishmentType = null;

        if(this.moderator.options.managers.warn.punishment.type instanceof Array) {
            if(this.moderator.options.managers.warn.limits instanceof Array) {
                if(warns === this.moderator.options.managers.warn.limits[0]) punishment = this.moderator.options.managers.warn.punishment.type[0];
                if(warns >= this.moderator.options.managers.warn.limits[1]) punishment = this.moderator.options.managers.warn.punishment.type[1];
            }else{
                if(warns === this.moderator.options.managers.warn.limits) punishment = this.moderator.options.managers.warn.punishment.type[0];
                if(warns >= this.moderator.options.managers.warn.limits) punishment = this.moderator.options.managers.warn.punishment.type[1];
            }
        }else{
            if(this.moderator.options.managers.warn.limits instanceof Array) {
                if(warns === this.moderator.options.managers.warn.limits[0]) punishment = this.moderator.options.managers.warn.punishment.type;
                if(warns >= this.moderator.options.managers.warn.limits[1]) punishment = this.moderator.options.managers.warn.punishment.type;
            }else{
                if(warns === this.moderator.options.managers.warn.limits) punishment = this.moderator.options.managers.warn.punishment.type;
                if(warns >= this.moderator.options.managers.warn.limits) punishment = this.moderator.options.managers.warn.punishment.type;
            }
        }

        return punishment;
    }

    /**
     * Method for generating a random ID
     * 
     * @param {number} len Length of generated ID
     * 
     * @returns {string} Returns the generated id
     */
    public generateID(len?: number): string {
        let id: string = "";
        const chars = "1234567890";

        for(let i = 0; i < (len || 18); i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }

        return id;
    }
}