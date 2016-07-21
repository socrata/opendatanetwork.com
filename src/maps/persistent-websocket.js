
class PersistentWebsocket {
    constructor(url) {
        this.url = url;
        this.open = false;
    }

    getSocket() {
        return new Promise((resolve, reject) => {
            if (this.open) {
                resolve(this.socket);
            } else {
                openSocket(this.url).then(socket => {
                    this.socket = socket;
                    this.socket.onclose = () => this.open = false;
                    this.socket.onmessage = message => this.onmessage(JSON.parse(message.data));
                    this.open = true;

                    resolve(this.socket);
                });
            }
        });
    }

    send(message) {
        this.getSocket().then(socket => {
            if (_.isPlainObject(message)) message = JSON.stringify(message);
            socket.send(message);
        });
    }

    onmessage(callback) {
        this.onmessage = callback;
        return this;
    }
}

function openSocket(url) {
    return new Promise((resolve, reject) => {
        try {
            const socket = new WebSocket(url);
            socket.onopen = () => resolve(socket);
        } catch (error) {
            reject(error);
        }
    });
}

