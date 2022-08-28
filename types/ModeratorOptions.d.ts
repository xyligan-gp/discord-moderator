import { PunishmentType } from "./Moderator";

export interface ModeratorOptions {
    database?: DatabaseConfig;
    managers?: ModeratorManagers;
}

interface DatabaseConfig {
    path?: string;
    name?: string;
}

interface ModeratorManagers {
    mute?: MuteManagerConfig;
    warn?: WarnManagerConfig;
}

interface MuteManagerConfig {
    isMutingOnJoin?: boolean;
    isEnabled?: boolean;
    interval: number;
}

interface WarnManagerConfig {
    isEnabled?: boolean;
    limits?: [number, number] | number;
    punishment?: WarnPunishmentConfig;
}

interface WarnPunishmentConfig {
    isEnabled?: boolean;
    time?: number;
    type?: [PunishmentType, PunishmentType] | PunishmentType;
}