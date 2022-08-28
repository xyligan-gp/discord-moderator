import { GuildMember, TextChannel } from "discord.js";

import { Moderator } from "../Moderator";
import { Events, PunishmentType } from "../ModeratorEnums";

import { GuildWarn } from "../../types/ModeratorDatabase";
import { ClearOptions, CreationWarnOptions, DefaultObject } from "../../types/ModeratorData";
import { ClearType } from "../../types/ModeratorEnums";

/**
 * Class that controls Moderation Warn System
 * 
 * @class
 * @classdesc Moderator Warn Manager Class
 */
export class WarnManager {
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
     * Method for issuing a warning to a Discord guild user
     * 
     * @param {GuildMember} member Discord Guild Member
     * @param {CreationWarnOptions} options Creation Warn Options
     * 
     * @returns {Promise<GuildWarn>} Returns an object with warning data
     */
    public add(member: GuildMember, options: CreationWarnOptions): Promise<GuildWarn> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(member.guild.id);

            const guildData = this.moderator.database.get(member.guild.id);
            const guildMemberWarns = guildData?.warns?.filter(warn => warn.users.target === member.id);
            const guildMemberActiveWarns = guildMemberWarns.filter(guildMemberWarn => !guildMemberWarn.unwarnedAt);

            const defaultWarnData: GuildWarn = {
                id: this.moderator.utils.generateID(),
                channelID: options.channel instanceof TextChannel ? options.channel.id : options.channel,
                
                users: {
                    target: member.id,
                    moderator: options.moderator ?? this.moderator.client.user.id
                },

                reason: options.reason ?? null,
                warnedAt: Date.now(),
                unwarnedAt: null
            }
            
            guildData.warns.push(defaultWarnData);

            this.moderator.database.set(member.guild.id, guildData);

            this.moderator.emit(Events.WARN_ADD, member.guild, defaultWarnData);

            if(this.moderator.options.managers.warn.punishment.isEnabled) {
                const punishment = this.moderator.utils.fetchPunishment(guildMemberActiveWarns.length + 1);
                
                if(punishment) await this.moderator.punish(punishment, member, {
                    time: punishment.includes(PunishmentType.TEMPMUTE) ? this.moderator.options.managers.warn.punishment.time : 0,
                    reason: options.reason ?? null,
                    moderator: options.moderator,

                    member: member,
                    channel: defaultWarnData.channelID
                })
            }

            return res(defaultWarnData);
        })
    }

    public delete(member: GuildMember, id: string): Promise<DefaultObject | GuildWarn> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(member.guild.id);

            const guildData = this.moderator.database.get(member.guild.id);
            const guildMemberWarns = guildData?.warns?.filter(warn => warn.users.target === member.id);
            const guildMemberActiveWarns = guildMemberWarns.filter(guildMemberWarn => !guildMemberWarn.unwarnedAt);

            if(!guildMemberActiveWarns.length) return res(
                {
                    status: false,
                    message: `User with ID '${member.id}' has no active warnings!`
                }
            )

            const guildMemberWarn = guildMemberActiveWarns.find(guildMemberActiveWarn => guildMemberActiveWarn.id === id);

            if(!guildMemberWarn) return res(
                {
                    status: false,
                    message: `Warnings with ID '${id}' not found with user with ID '${member.id}' in Discord guild with ID '${member.guild.id}'!`
                }
            )

            guildMemberWarn.unwarnedAt = Date.now();

            guildMemberActiveWarns.filter(guildMemberActiveWarn => guildMemberActiveWarn.id != id);
            guildMemberActiveWarns.push(guildMemberWarn);

            this.moderator.database.set(member.guild.id, guildData);

            return res(guildMemberWarn);
        })
    }

    public clear(options?: ClearOptions): Promise<boolean> {
        return new Promise(async (res, rej) => {
            if(!options?.type) options.type = ClearType.ALL;
        })
    }
}