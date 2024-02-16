const winston = require('winston');

class NoRepeatConsoleTransport extends winston.transports.Console {
    constructor(opts) {
        super(opts);
        this.lastMessage = null;
    }

    log(info, callback) {
        if (info.message === this.lastMessage) {
            // Skip logging if the message is the same as the last one
            setImmediate(() => this.emit('logged', info));
            callback();
            return;
        }
        this.lastMessage = info.message;
        super.log(info, callback);
    }
}

class NoRepeatFileTransport extends winston.transports.File {
    constructor(opts) {
        super(opts);
        this.lastMessage = null;
    }

    log(info, callback) {
        if (info.message === this.lastMessage) {
            // Skip logging if the message is the same as the last one
            setImmediate(() => this.emit('logged', info));
            callback();
            return;
        }
        this.lastMessage = info.message;
        super.log(info, callback);
    }
}

module.exports = {
    NoRepeatConsoleTransport,
    NoRepeatFileTransport
};