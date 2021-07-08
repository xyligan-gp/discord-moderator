const { EventEmitter } = require('events');
const event = new EventEmitter();

/**
 * Moderator EventEmitter
 * @private
*/
class Emitter {
    /**
     * @param {String} eventName Event Name
     * @param {Function} fn Callback
    */
    on(eventName, fn) {
        event.on(eventName, fn)
    }
    /**
     * @param {String} eventName Event Name
     * @param {Function} fn Callback
    */
    once(eventName, fn) {
        event.once(eventName, fn)
    }
    
    /**
     * @param {String} eventName Event Name
     * @param {Function} fn Callback
    */
    emit(eventName, ...args) {
        event.emit(eventName, args[0])
    }
}

module.exports = Emitter;