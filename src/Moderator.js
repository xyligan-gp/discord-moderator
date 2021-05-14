const { EventEmitter } = require('events'), base = require('quick.db'), { Client, GuildMember, Channel, Guild } = require('discord.js'),
ms = require('./modules/ms.js'), ModeratorErrors = require('./ModeratorErrors.js'), ModeratorError = require('./ModeratorError.js');

/**
 * Moderator
*/
module.exports = class Moderator extends EventEmitter {
    /**
     * @param {Client} client Discord Client
     * @param {Object} options Moderator Options
     * @param {String} options.mutesTableName Table name for mutes
     * @param {Number} options.checkMutesCountdown Mutes check interval
     * @param {String} options.warnsTableName Table name for warns
    */
    constructor(client, options) {
        super();
        if (!client) return new ModeratorError(ModeratorErrors.requireClient);

        /**
         * Discord Client
        */
        this.client = client;

        /**
         * Whether the manager is ready
        */
        this.ready = false;

        /**
         * Moderator Options Manager
        */
        this.options = options;

        this._init();

        client.on('guildMemberAdd', async member => {
            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

            let mutesData = base.fetch(this.options.mutesTableName);

            if(!mutesData || mutesData == null) return;

            let searchMutes = mutesData.find(data => data.userID === member.id);
            if(!searchMutes) return;

            if(searchMutes.guildID != member.guild.id) return;

            let muteRolePosition = member.guild.roles.cache.get(searchMutes.muteRoleID).position;
            let clientRolePosition = member.guild.members.cache.get(client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return new ModeratorError(ModeratorErrors.MissingAccess);

            member.roles.add(searchMutes.muteRoleID);
        })

        client.on('ready', () => {
            if(!options.mutesTableName || typeof options.mutesTableName != 'string' || !options.checkMutesCountdown || typeof options.checkMutesCountdown != 'number' || !options.warnsTableName || typeof options.warnsTableName != 'string') {
                new ModeratorError(ModeratorErrors.incorrectConstructorOptions);
                return process.exit();
            }

            setInterval(async () => {
                let mutesData = base.fetch(options.mutesTableName);
    
                if(!mutesData || mutesData == null) return;
    
                for(var i = 0; i < mutesData.length; i++) {
                    let nowTime = new Date().getTime();
                    let muteNowTime = mutesData[i].nowTime;
                    let muteTime = mutesData[i].muteTime;

                    if(muteTime == null) return;
    
                    if(nowTime - muteNowTime > muteTime) {
                        let guild = client.guilds.cache.get(mutesData[i].guildID);
                        if(!guild) return;

                        let member = guild.members.cache.get(mutesData[i].userID);
                        if(!member) return;

                        if(!member.roles.cache.has(mutesData[i].muteRoleID)) {
                            let newBase = mutesData.filter(obj => obj.nowTime != muteNowTime);
                            base.set(options.mutesTableName, newBase);

                            return client.channels.cache.get(mutesData[i].channelID).send('GGWP');
                        }else{
                            let muteRolePosition = member.guild.roles.cache.get(mutesData[i].muteRoleID).position;
                            let clientRolePosition = member.guild.members.cache.get(client.user.id).roles.highest.position;

                            if(muteRolePosition > clientRolePosition) return new ModeratorError(ModeratorErrors.MissingAccess);

                            await member.roles.remove(mutesData[i].muteRoleID);
                            
                            let newBase = mutesData.filter(obj => obj.nowTime != muteNowTime);
                            base.set(options.mutesTableName, newBase);

                            this.emit('muteEnded', mutesData[i]);
                        }
                    }
                }
            }, options.checkMutesCountdown);
        })
    }

    /**
     * Method for adding warns to user
     * @param {GuildMember} member Discord GuildMember
     * @param {Channel} channel Discord Channel
     * @param {String} reason Warn Reason
     * @param {String} authorID Warn Author ID
     * @returns {Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string }}>} Warn Object
    */
    addWarn(member, channel, reason, authorID) {
        let object = {
            guildID: String(),
            userID: String(),
            channelID: String(),
            nowTime: Number(),
            warnNumber: Number(),
            warnReason: String(),
            warnBy: String()
        }

        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));

            let warnsData = base.fetch(`${this.options.warnsTableName}.${member.guild.id}.${member.id}`);

            object.guildID = member.guild.id;
            object.userID = member.id;
            object.channelID = channel.id;
            object.nowTime = new Date().getTime();
            object.warnReason = reason;
            object.warnBy = authorID;

            if(!warnsData || warnsData == null) {
                object.warnNumber = 1;

                base.set(`${this.options.warnsTableName}.${member.guild.id}.${member.id}`, [object]);

                return resolve({ status: true, data: object });
            }else{
                object.warnNumber = warnsData.length + 1;
                base.push(`${this.options.warnsTableName}.${member.guild.id}.${member.id}`, object);

                return resolve({ status: true, data: object });
            }
        })
    }

    /**
     * Method for getting user warnings
     * @param {GuildMember} member Discord GuildMember
     * @returns {Promise<{ status: boolean, warns: number, data: [{ guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string }] }>} User Warns Object
    */
    getWarns(member) {
        let object = {
            guildID: String(),
            userID: String(),
            channelID: String(),
            nowTime: Number(),
            warnNumber: Number(),
            warnReason: String(),
            warnBy: String()
        }

        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            let warnsData = base.fetch(`${this.options.warnsTableName}.${member.guild.id}.${member.id}`);

            if(!warnsData || warnsData == null) {
                object.guildID = member.guild.id;
                object.userID = member.id;
                object.channelID = null,
                object.nowTime = null,
                object.warnNumber = null,
                object.warnReason = null,
                object.warnBy = null

                return resolve({ status: true, warns: 0, data: [object] });
            }else{
                let warns = [];

                for(let i = 0; i < warnsData.length; i++) {
                    await warns.push({
                        guildID: warnsData[i].guildID,
                        userID: warnsData[i].userID,
                        channelID: warnsData[i].channelID,
                        nowTime: warnsData[i].nowTime,
                        warnNumber: warnsData[i].warnNumber,
                        warnReason: warnsData[i].warnReason,
                        warnBy: warnsData[i].warnBy
                    });
                }

                return resolve({ status: true, warns: warns.length, data: warns })
            }
        })
    }

    /**
     * Method for removing warnings from a user
     * @param {GuildMember} member Discord GuildMember
     * @returns {Promise<{ status: boolean, warns: number, data: [{ guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string }] }>} User Warns Object
    */
    removeWarn(member) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            let warnsData = base.fetch(`${this.options.warnsTableName}.${member.guild.id}.${member.id}`);

            if(!warnsData || warnsData == null) return resolve({ status: false, warns: 0, data: [] });

            if(warnsData.length < 2) {
                base.delete(`${this.options.warnsTableName}.${member.guild.id}.${member.id}`);

                return resolve({ status: true, warns: 0, data: [] });
            }else{
                let newWarns = warnsData.filter(data => data.warnNumber != warnsData.length);
                base.set(`${this.options.warnsTableName}.${member.guild.id}.${member.id}`, newWarns);

                return resolve({ status: true, warns: newWarns.length, data: newWarns });
            }
        })
    }

    /**
     * Method for issuing a mute to a user
     * @param {GuildMember} member Discord GuildMember
     * @param {Channel} channel Discord Channel
     * @param {String} muteRoleID Mute Role ID
     * @param {String} muteReason Mute reason
     * @returns {Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, muteRoleID: string, muteTime: number, nowTime: number, muteReason: string } }>} Object
    */
    mute(member, channel, muteRoleID, muteReason) {
        let object = {
            guildID: String(),
            userID: String(),
            channelID: String(),
            muteRoleID: String(),
            muteTime: Number(),
            nowTime: Number(),
            muteReason: String()
        }

        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteRoleID')));
            if(!muteReason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteReason')));

            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            object.guildID = member.guild.id;
            object.userID = member.id;
            object.channelID = channel.id;
            object.muteRoleID = muteRoleID;
            object.muteTime = null;
            object.nowTime = new Date().getTime();
            object.muteReason = muteReason;

            let mutesData = base.fetch(this.options.mutesTableName);
            let muteRolePosition = member.guild.roles.cache.get(muteRoleID).position;
            let clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            if(!mutesData || mutesData == null) {
                try {
                    await member.roles.add(muteRoleID);

                    await base.set(this.options.mutesTableName, [object]);

                    return resolve({ status: true, data: object });
                }catch(error){
                    return reject(error);
                }
            }else{
                let searchMute = mutesData.find(data => data.userID === member.id);
                if(searchMute) return reject(new ModeratorError(ModeratorErrors.mute.userAlreadyMuted.replace('{ID}', member.id)));

                try {
                    await member.roles.add(muteRoleID);

                    await base.push(this.options.mutesTableName, object);

                    return resolve({ status: true, data: object });
                }catch(error){
                    return reject(error);
                }
            }
        })
    }

    /**
     * Method for issuing a tempmute to a user
     * @param {GuildMember} member Discord GuildMember
     * @param {Channel} channel Discord Channel
     * @param {String} muteRoleID Mute Role ID
     * @param {String} muteTime Mute Time
     * @param {String} muteReason Mute Reason
     * @returns {Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, muteRoleID: string, muteTime: number, muteReason: string } }>} Object
    */
    tempmute(member, channel, muteRoleID, muteTime, muteReason) {
        let object = {
            guildID: String(),
            userID: String(),
            channelID: String(),
            muteRoleID: String(),
            muteTime: Number(),
            nowTime: Number(),
            muteReason: String()
        }

        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteRoleID')));
            if(!muteTime) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteTime')));
            if(!muteReason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteReason')));

            if(!ms(muteTime)) return reject(new ModeratorError(ModeratorErrors.tempmute.invalidValue));

            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            object.guildID = member.guild.id;
            object.userID = member.id;
            object.channelID = channel.id;
            object.muteRoleID = muteRoleID;
            object.muteTime = ms(muteTime);
            object.nowTime = new Date().getTime();
            object.muteReason = muteReason;

            let mutesData = base.fetch(this.options.mutesTableName);
            let muteRolePosition = member.guild.roles.cache.get(muteRoleID).position;
            let clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            if(!mutesData || mutesData == null) {
                try {
                    await member.roles.add(muteRoleID);

                    await base.set(this.options.mutesTableName, [object]);

                    return resolve({ status: true, data: object });
                }catch(error){
                    return reject(error);
                }
            }else{
                let searchMute = mutesData.find(data => data.userID === member.id);
                if(searchMute) return reject(new ModeratorError(ModeratorErrors.mute.userAlreadyMuted.replace('{ID}', member.id)));

                try {
                    await member.roles.add(muteRoleID);

                    await base.push(this.options.mutesTableName, object);

                    return resolve({ status: true, data: object });
                }catch(error){
                    return reject(error);
                }
            }
        })
    }

    /**
     * Method for removing the mute to the user
     * @param {GuildMember} member Discord GuildMember
     * @returns {Promise<{ status: boolean }>} Unmute Status
    */
    unmute(member) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            let mutesData = base.fetch(this.options.mutesTableName);

            if(!mutesData || mutesData == null) return reject(new ModeratorError(ModeratorErrors.cleanBase.replace('{parameter}', 'Mutes')));

            let searchMute = mutesData.find(data => data.userID === member.id);
            if(!searchMute) return reject(new ModeratorError(ModeratorErrors.unmute.userAlreadyUnMuted.replace('{ID}', member.id)));

            try {
                let muteRolePosition = member.guild.roles.cache.get(searchMute.muteRoleID).position;
                let clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

                if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

                await member.roles.remove(searchMute.muteRoleID).catch(error => { return reject(error) });

                let newBase = mutesData.filter(data => data.userID != member.id);
                await base.set(this.options.mutesTableName, newBase);

                return resolve({ status: true });
            }catch(error){
                return reject(error);
            }
        })
    }

    /**
     * Method for removing all mutes from the database
     * @returns {boolean} Clearing Status
    */
    clearMutes() {
        let mutesData = base.fetch(this.options.mutesTableName);
        if(!mutesData || mutesData == null) return false;

        base.delete(this.options.mutesTableName);

        return true;
    }

    /**
     * Method for removing all warns from the database
     * @returns {boolean} Clearing Status
    */
    clearWarns() {
        let warnsData = base.fetch(this.options.warnsTableName);
        if(!warnsData || warnsData == null) return false;

        base.delete(this.options.warnsTableName);

        return true;
    }

    /**
     * Method for initialization module
     * @private 
    */
    _init() {
        this.ready = true;
        this.version = require('../package.json').version;
        this.author = require('../package.json').author;
    }

    /**
     * Method for checking permissions on the server
     * @param {Array} permissionsArray Permissions Array
     * @param {Guild} guild Discord Guild
     * @return {Boolean} Boolean
     * @private
    */
    _checkPermissions(permissionsArray, guild) {
        let user = guild.members.cache.get(this.client.user.id);
        if(user.roles.highest.permissions.has(permissionsArray)) return true;
        return false;
    }
}