'use strict';

const path = require('path');
const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');

class PagesController {
    static join(req, res) {
        res.locals.css = 'join.css';
        res.locals.title = 'Join the Open Data Network.';
        res.render('join.ejs');
    }

    static joinComplete(req, res) {
        res.locals.css = 'join-complete.css';
        res.locals.title = 'Thanks for joining the Open Data Network.';
        res.render('join-complete.ejs');
    }
}

module.exports = PagesController;
