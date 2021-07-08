const ModeratorBot = require('../classes/Client.js');

module.exports = {
    name: 'ready',

    /**
     * @param {ModeratorBot} client Discord Client
     */
    run: async(client) => {
        return console.log(`${client.user.tag} ready!`);
    }
}