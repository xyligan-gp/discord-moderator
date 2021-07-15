module.exports = {
    warnManagerDisabled: `The warning system is disabled by the Moderator option called 'warnManager'`,
    muteManagerDisabled: `Mute manager is disabled by Moderator option called 'muteManager'`,
    blacklistManagerDisabled: `Blacklist manager is disabled by Moderator option called 'blacklistManager'`,
    requireClient: `Client is a required option!`,
    parameterNotFound: `The parameter '{parameter}' was not received!`,
    cleanBase: `{parameter} not found in the database!`,
    MissingAccess: `Missing Access!`,
    MissingPermissions: `Missing Permissions!`,

    warnManager: {
        get: {
            notData: `No information found for '{userID}!`,
            invalidWarn: `Warning with ID '{ID}' not found for '{userID}'!`
        }
    },

    muteManager: {
        add: {
            userAlreadyMuted: `The user with ID '{ID}' is already muted!`
        },

        temp: {
            invalidValue: `Wrong time format received!`
        },

        remove: {
            userAlreadyUnMuted: `The user with ID '{ID}' is already unmuted!`
        }
    },

    rolesManager: {
        add: {
            invalidTypeArg: `The parameter '{parameter}' has an invalid type!`,
            hasRole: `User '{userID}' already has a role named '{roleName}'`,
            error: `An unexpected error occurred while adding a role!`
        },

        get: {
            invalidTypeArg: `The parameter '{parameter}' has an invalid type!`
        },

        remove: {
            invalidTypeArg: `The parameter '{parameter}' has an invalid type!`,
            notHasRole: `User '{userID}' not already has a role named '{roleName}'`,
            error: `An unexpected error occurred while removing a role!`
        },

        delete: {
            error: `An unexpected error occurred while deleting a role`
        }
    },

    blacklistManager: {
        add: {
            userBlocked: `User '{userID}' is already blocked on server '{guildID}'!`
        },

        remove: {
            userNotBlocked: `User '{userID}' is already unblocked on server '{guildID}'!`
        }
    }
}