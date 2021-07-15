module.exports = {
    Mute: {
        guildID: String(),

        userID: String(),
        
        channelID: String(),

        muteRoleID: String(),

        muteTime: Number() || null,

        nowTime: Number(),

        muteReason: String()
    },

    Warn: {
        guildID: String(),

        userID: String(),

        channelID: String(),

        nowTime: Number(),

        warnNumber: Number(),

        warnReason: String(),

        warnBy: String()
    },

    Block: {
        guildID: String(),

        userID: String(),

        nowTime: Number(),

        blockNumber: Number(),

        blockReason: String(),

        blockedBy: String()
    }
}