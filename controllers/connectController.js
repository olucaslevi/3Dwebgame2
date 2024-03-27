import io from 'socket.io-client';

class ConnectController {
    constructor() {
        this.socket = io('http://localhost:3000');
        this.socket.on('connect', () => {
            this.socket.emit('update', 'Hello Server');
        });
    }
    send(message) {
        this.socket.emit('update', message);
    }
    on(event, callback) {
        this.socket.on(event, callback);
    }
    off(event, callback) {
        this.socket.off(event, callback);
    }
}

export default ConnectController;
