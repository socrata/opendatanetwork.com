'use strict';

class ErrorHandler {
    static error(req, res, statusCode, title) {
        statusCode = statusCode || 500;
        title = title || 'Internal server error';

        return (error) => {
            const type = statusCode < 500 ? 'client' : 'server';
            const stack = error && error.stack ? `\n${error.stack}` : '';
            console.error(`at=error status=${statusCode} type=${type} path="${req.path}" ${stack}`);
            res.status(statusCode);
            res.render('error.ejs', {statusCode, title});
        };
    }
}

module.exports = ErrorHandler;
