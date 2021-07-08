const ModeratorBot = require('../../classes/Client.js');

module.exports = {
    name: 'addWarn',

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {import('discord-moderator').WarnData} data Event Data
    */
    run: async(client, data) => {
        const guild = client.guilds.cache.get(data.guildID);
        const member = guild.members.cache.get(data.userID);

        return console.log(`User ${member.user.tag} got a warn on server ${guild.name} for ${data.warnReason}!`);
    }
}