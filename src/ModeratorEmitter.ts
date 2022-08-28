import EventEmitter from "events";
const emitter = new EventEmitter();

import { Events } from "./ModeratorEnums";

/**
 * Class that controls Moderator Emitter
 * 
 * @class
 * @classdesc Moderator Emitter Class
 * 
 * @private
 */
export class ModeratorEmitter {
    /**
     * Method for listening Moderator events
     * 
     * @param {Events} event Event Name
     * @param {any} data Event Data
     * 
     * @returns {EventEmitter} EventEmitter Class
     */
    on(event: Events, data: any): EventEmitter {
        return emitter.on(event, data);
    }

    /**
     * Method to listen for an Moderator event only once
     * 
     * @param {Events} event Event Name
     * @param {any} data Event Data
     * 
     * @returns {EventEmitter} EventEmitter Class
     */
    once(event: Events, data: any): EventEmitter {
        return emitter.once(event, data);
    }

    /**
     * Method for emits Moderator events
     * 
     * @param {Events} event Event Name
     * @param {any} args Event Args
     * 
     * @returns {boolean} Event emit status
     */
    emit(event: Events, ...args: any): boolean {
        return emitter.emit(event, ...args);
    }
}