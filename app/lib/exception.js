'use strict';

const _ = require('lodash');

class Exception {
    constructor(message, statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }

    static notFound(message) {
        return new Exception(message, 404);
    }

    static invalidParam(message) {
        return new Exception(message, 422);
    }

    static server(message) {
        return new Exception(message, 500);
    }

    static timeout(message) {
        return new Exception(message, 504);
    }

    static invalidAppToken(token) {
        return new Exception(`invalid app token: ${token}`, 403);
    }

    static missingAppToken() {
        return new Exception(`App token required as 'app_token' parameter or 'X-App-Token' header.
                Get an app token here: https://dev.socrata.com/docs/app-tokens.html`, 403);
    }

    static getHandler(request, response) {
        return error => {
            Exception.respond(error, request, response);
        };
    }

    static getSocketHandler(socket, message) {
        return error => {
            socket.send(JSON.stringify({
                message,
                error,
                type: 'error'
            }));
        };
    }

    static respond(error, request, response, next, statusCode) {
        statusCode = error.statusCode || statusCode || 500;

        if (statusCode >= 500) console.log(error);

        const errorJSON = {
            error: {
                message: error.message.replace(/\n\s*/, ' ')
            },
            statusCode,
            url: request.url
        };

        response
            .status(statusCode)
            .render('error.ejs', {statusCode, title: error.message});
    }
}

module.exports = Exception;

