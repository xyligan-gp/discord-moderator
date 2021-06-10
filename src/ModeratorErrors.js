module.exports = {
    warnSystemDisabled: `The warning system is disabled by the Moderator option called 'warnSystem'`,
    muteSystemDisabled: `Mute system is disabled by Moderator option called 'muteSystem'`,
    incorrectConstructorOptions: `Please check the constructor options discord-moderator!`,
    requireClient: `Client is a required option!`,
    parameterNotFound: `The parameter '{parameter}' was not received!`,
    cleanBase: `{parameter} not found in the database!`,
    MissingAccess: `Missing Access!`,
    MissingPermissions: `Missing Permissions!`,

    constructorOptions: {
        optionNotFound: `Option '{option}' not found! Check Moderator Constructor!`,
        invalidOptionType: `Invalid type for option '{option}'! Received: '{type}'`,
        invalidValue: `An invalid value was specified for the '{option}'. Recommended value: '{value}'`
    },

    mute: {
        userAlreadyMuted: `The user with ID '{ID}' is already muted!`
    },

    tempmute: {
        invalidValue: `Wrong time format received!`
    },

    unmute: {
        userAlreadyUnMuted: `The user with ID '{ID}' is already unmuted!`
    }
}